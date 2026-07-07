<?php

if (!defined('ABSPATH')) {
    exit;
}

class Euforia_Puntos_Points_Engine {
    public static function init(): void {
        // Engine is called from WooCommerce and REST.
    }

    public static function credit_order(WC_Order $order): array {
        $order_id = $order->get_id();
        if (Euforia_Puntos_Database::order_already_credited($order_id)) {
            return ['success' => false, 'message' => 'already_credited'];
        }

        $dni = Euforia_Puntos_DNI::from_order($order);
        if (!$dni) {
            return ['success' => false, 'message' => 'missing_dni'];
        }

        $currency = $order->get_currency();
        $total = (float) $order->get_total();
        $points = Euforia_Puntos_Settings::calculate_points_from_amount($total, $currency);

        if ($points <= 0) {
            return ['success' => false, 'message' => 'zero_points'];
        }

        $user_id = $order->get_user_id() ?: null;
        $account = Euforia_Puntos_Database::get_or_create_account($dni, $user_id);
        $new_balance = (int) $account['balance'] + $points;

        global $wpdb;
        $wpdb->update(
            Euforia_Puntos_Database::accounts_table(),
            ['balance' => $new_balance],
            ['dni' => $dni],
            ['%d'],
            ['%s']
        );

        Euforia_Puntos_Database::add_ledger_entry([
            'dni' => $dni,
            'type' => 'earn',
            'points' => $points,
            'balance_after' => $new_balance,
            'order_id' => $order_id,
            'note' => sprintf(
                __('Puntos por pedido #%d (%s %s)', 'euforia-puntos'),
                $order_id,
                $currency,
                number_format_i18n($total, 2)
            ),
        ]);

        $order->add_order_note(
            sprintf(__('Euforia Puntos: +%d puntos acreditados al DNI %s.', 'euforia-puntos'), $points, $dni)
        );
        $order->update_meta_data('_euforia_puntos_credited', $points);
        $order->update_meta_data('_euforia_puntos_dni', $dni);
        $order->save();

        return [
            'success' => true,
            'points' => $points,
            'balance' => $new_balance,
            'dni' => $dni,
        ];
    }

    public static function redeem(string $dni, int $reward_id): array {
        $dni = Euforia_Puntos_DNI::normalize($dni);
        if (!$dni) {
            return ['success' => false, 'message' => __('DNI inválido.', 'euforia-puntos')];
        }

        $reward = Euforia_Puntos_Rewards::get($reward_id);
        if (!$reward || !$reward['enabled']) {
            return ['success' => false, 'message' => __('Premio no disponible.', 'euforia-puntos')];
        }

        $balance = Euforia_Puntos_Database::get_balance($dni);
        if ($balance < $reward['points_cost']) {
            return [
                'success' => false,
                'message' => __('No tenés puntos suficientes.', 'euforia-puntos'),
                'balance' => $balance,
                'required' => $reward['points_cost'],
            ];
        }

        $redemption_result = self::fulfill_reward($dni, $reward);
        if (!$redemption_result['success']) {
            return $redemption_result;
        }

        $new_balance = $balance - $reward['points_cost'];
        global $wpdb;
        $wpdb->update(
            Euforia_Puntos_Database::accounts_table(),
            ['balance' => $new_balance],
            ['dni' => $dni],
            ['%d'],
            ['%s']
        );

        $wpdb->insert(
            Euforia_Puntos_Database::redemptions_table(),
            [
                'dni' => $dni,
                'reward_id' => $reward['id'],
                'points_spent' => $reward['points_cost'],
                'status' => $redemption_result['status'] ?? 'completed',
                'coupon_code' => $redemption_result['coupon_code'] ?? null,
                'meta' => wp_json_encode($redemption_result['meta'] ?? []),
            ],
            ['%s', '%d', '%d', '%s', '%s', '%s']
        );
        $redemption_id = (int) $wpdb->insert_id;

        Euforia_Puntos_Database::add_ledger_entry([
            'dni' => $dni,
            'type' => 'redeem',
            'points' => -$reward['points_cost'],
            'balance_after' => $new_balance,
            'reward_id' => $reward['id'],
            'redemption_id' => $redemption_id,
            'note' => sprintf(__('Canje: %s', 'euforia-puntos'), $reward['title']),
        ]);

        return [
            'success' => true,
            'balance' => $new_balance,
            'redemption_id' => $redemption_id,
            'coupon_code' => $redemption_result['coupon_code'] ?? null,
            'message' => $redemption_result['message'] ?? __('Canje realizado con éxito.', 'euforia-puntos'),
            'status' => $redemption_result['status'] ?? 'completed',
        ];
    }

    private static function fulfill_reward(string $dni, array $reward): array {
        switch ($reward['reward_type']) {
            case Euforia_Puntos_Rewards::TYPE_PERCENT:
            case Euforia_Puntos_Rewards::TYPE_FIXED:
                return self::create_coupon_for_reward($dni, $reward);
            case Euforia_Puntos_Rewards::TYPE_MERCH:
                return [
                    'success' => true,
                    'status' => 'pending',
                    'message' => __('Solicitud de merchandising registrada. Te contactaremos para coordinar la entrega.', 'euforia-puntos'),
                    'meta' => [
                        'item' => $reward['config']['item_name'] ?? $reward['title'],
                    ],
                ];
            default:
                return ['success' => false, 'message' => __('Tipo de premio no soportado.', 'euforia-puntos')];
        }
    }

    private static function create_coupon_for_reward(string $dni, array $reward): array {
        if (!class_exists('WC_Coupon')) {
            return ['success' => false, 'message' => 'WooCommerce no disponible'];
        }

        $code = 'EUFP-' . strtoupper(wp_generate_password(8, false, false));
        $coupon = new WC_Coupon();
        $coupon->set_code($code);
        $coupon->set_usage_limit(1);
        $coupon->set_usage_limit_per_user(1);
        $coupon->set_individual_use(true);
        $coupon->set_description(
            sprintf(__('Canje Euforia Puntos — DNI %s — %s', 'euforia-puntos'), $dni, $reward['title'])
        );

        $config = $reward['config'];
        if ($reward['reward_type'] === Euforia_Puntos_Rewards::TYPE_PERCENT) {
            $percent = min(100, max(1, (float) ($config['percent'] ?? 10)));
            $coupon->set_discount_type('percent');
            $coupon->set_amount($percent);
        } else {
            $amount = max(0.01, (float) ($config['amount'] ?? 0));
            $currency = strtoupper($config['currency'] ?? 'ARS');
            $coupon->set_discount_type('fixed_cart');
            $coupon->set_amount($amount);
            if ($currency === 'USD' && function_exists('get_woocommerce_currency')) {
                $coupon->update_meta_data('_euforia_reward_currency', 'USD');
            }
        }

        $coupon->update_meta_data('_euforia_puntos_dni', $dni);
        $coupon->update_meta_data('_euforia_puntos_reward_id', $reward['id']);
        $coupon_id = $coupon->save();

        if (!$coupon_id) {
            return ['success' => false, 'message' => __('No se pudo crear el cupón.', 'euforia-puntos')];
        }

        return [
            'success' => true,
            'status' => 'completed',
            'coupon_code' => $code,
            'coupon_id' => $coupon_id,
            'message' => sprintf(
                __('¡Listo! Usá el cupón %s en el checkout.', 'euforia-puntos'),
                $code
            ),
        ];
    }

    public static function manual_adjustment(string $dni, int $points, string $note = ''): array {
        $dni = Euforia_Puntos_DNI::normalize($dni);
        if (!$dni) {
            return ['success' => false, 'message' => 'invalid_dni'];
        }
        if ($points === 0) {
            return ['success' => false, 'message' => 'zero_points'];
        }

        $account = Euforia_Puntos_Database::get_or_create_account($dni);
        $new_balance = (int) $account['balance'] + $points;
        if ($new_balance < 0) {
            return ['success' => false, 'message' => 'negative_balance'];
        }

        global $wpdb;
        $wpdb->update(
            Euforia_Puntos_Database::accounts_table(),
            ['balance' => $new_balance],
            ['dni' => $dni],
            ['%d'],
            ['%s']
        );

        Euforia_Puntos_Database::add_ledger_entry([
            'dni' => $dni,
            'type' => 'adjust',
            'points' => $points,
            'balance_after' => $new_balance,
            'note' => $note ?: __('Ajuste manual', 'euforia-puntos'),
        ]);

        return ['success' => true, 'balance' => $new_balance];
    }
}
