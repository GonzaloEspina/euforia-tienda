<?php

if (!defined('ABSPATH')) {
    exit;
}

class Euforia_Puntos_Redemptions {
    public const STATUS_PENDING = 'pending';
    public const STATUS_USED = 'used';
    public const STATUS_EXPIRED = 'expired';

    public static function init(): void {
        add_action('woocommerce_order_status_processing', [__CLASS__, 'mark_coupons_used_from_order'], 20);
        add_action('woocommerce_order_status_completed', [__CLASS__, 'mark_coupons_used_from_order'], 20);
        add_action('woocommerce_order_status_on-hold', [__CLASS__, 'mark_coupons_used_from_order'], 20);
    }

    /**
     * @return array{mode:string,fixed_date?:string,relative_value?:int,relative_unit?:string}
     */
    public static function get_expiration_config(array $reward): array {
        $config = $reward['config'] ?? [];
        $expiration = $config['expiration'] ?? [];
        if (!is_array($expiration)) {
            $expiration = [];
        }

        $mode = sanitize_key($expiration['mode'] ?? 'none');
        if (!in_array($mode, ['none', 'fixed_date', 'relative'], true)) {
            $mode = 'none';
        }

        return [
            'mode' => $mode,
            'fixed_date' => isset($expiration['fixed_date']) ? (string) $expiration['fixed_date'] : '',
            'relative_value' => max(0, (int) ($expiration['relative_value'] ?? 0)),
            'relative_unit' => in_array($expiration['relative_unit'] ?? '', ['days', 'months'], true)
                ? $expiration['relative_unit']
                : 'days',
        ];
    }

    public static function calculate_expires_at(array $reward, ?string $redeemed_at = null): ?string {
        $expiration = self::get_expiration_config($reward);
        if ($expiration['mode'] === 'none') {
            return null;
        }

        $base = $redeemed_at ? strtotime($redeemed_at) : time();
        if (!$base) {
            $base = time();
        }

        if ($expiration['mode'] === 'fixed_date' && $expiration['fixed_date'] !== '') {
            $timestamp = strtotime($expiration['fixed_date'] . ' 23:59:59');
            return $timestamp ? gmdate('Y-m-d H:i:s', $timestamp) : null;
        }

        if ($expiration['mode'] === 'relative' && $expiration['relative_value'] > 0) {
            $modifier = '+' . $expiration['relative_value'] . ' '
                . ($expiration['relative_unit'] === 'months' ? 'months' : 'days');
            $timestamp = strtotime($modifier, $base);
            return $timestamp ? gmdate('Y-m-d H:i:s', $timestamp) : null;
        }

        return null;
    }

    public static function expire_stale(): void {
        global $wpdb;
        $table = Euforia_Puntos_Database::redemptions_table();
        $now = current_time('mysql', true);

        $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$table}
                SET status = %s
                WHERE status = %s
                AND expires_at IS NOT NULL
                AND expires_at < %s",
                self::STATUS_EXPIRED,
                self::STATUS_PENDING,
                $now
            )
        );
    }

    public static function sync_redemption_status(array $row): array {
        self::expire_stale();

        $status = $row['status'] ?? self::STATUS_PENDING;
        if ($status === 'completed') {
            $status = self::STATUS_USED;
        }

        if (!empty($row['coupon_code']) && $status === self::STATUS_PENDING) {
            $coupon = new WC_Coupon($row['coupon_code']);
            if ($coupon->get_id() && $coupon->get_usage_count() > 0) {
                self::update_status((int) $row['id'], self::STATUS_USED);
                $row['status'] = self::STATUS_USED;
                $row['used_at'] = $row['used_at'] ?: current_time('mysql', true);
                return $row;
            }
        }

        if ($status === self::STATUS_PENDING && !empty($row['expires_at'])) {
            $expires = strtotime((string) $row['expires_at']);
            if ($expires && $expires < time()) {
                self::update_status((int) $row['id'], self::STATUS_EXPIRED);
                $row['status'] = self::STATUS_EXPIRED;
            }
        }

        return $row;
    }

    public static function update_status(int $id, string $status, ?string $used_at = null): void {
        global $wpdb;
        $data = ['status' => $status];
        $format = ['%s'];

        if ($used_at !== null) {
            $data['used_at'] = $used_at;
            $format[] = '%s';
        }

        $wpdb->update(
            Euforia_Puntos_Database::redemptions_table(),
            $data,
            ['id' => $id],
            $format,
            ['%d']
        );
    }

    public static function mark_coupons_used_from_order(int $order_id): void {
        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }

        foreach ($order->get_coupon_codes() as $code) {
            $coupon = new WC_Coupon($code);
            if (!$coupon->get_id()) {
                continue;
            }

            $reward_id = (int) $coupon->get_meta('_euforia_puntos_reward_id');
            if (!$reward_id) {
                continue;
            }

            global $wpdb;
            $row = $wpdb->get_row(
                $wpdb->prepare(
                    'SELECT * FROM ' . Euforia_Puntos_Database::redemptions_table()
                    . ' WHERE coupon_code = %s ORDER BY id DESC LIMIT 1',
                    $code
                ),
                ARRAY_A
            );

            if ($row) {
                self::update_status((int) $row['id'], self::STATUS_USED, current_time('mysql', true));
            }
        }
    }

    public static function public_summary(array $row): array {
        $row = self::sync_redemption_status($row);
        $status = $row['status'] ?? self::STATUS_PENDING;
        if ($status === 'completed') {
            $status = self::STATUS_USED;
        }

        return [
            'id' => (int) $row['id'],
            'reward_title' => $row['reward_title'] ?? '',
            'reward_id' => (int) ($row['reward_id'] ?? 0),
            'points_spent' => (int) ($row['points_spent'] ?? 0),
            'status' => $status,
            'status_label' => self::status_label($status),
            'coupon_code' => $row['coupon_code'] ?? null,
            'created_at' => $row['created_at'] ?? null,
            'expires_at' => $row['expires_at'] ?? null,
            'used_at' => $row['used_at'] ?? null,
        ];
    }

    public static function status_label(string $status): string {
        switch ($status) {
            case self::STATUS_USED:
            case 'completed':
                return __('Usado', 'euforia-puntos');
            case self::STATUS_EXPIRED:
                return __('Vencido', 'euforia-puntos');
            case self::STATUS_PENDING:
            default:
                return __('Pendiente de uso', 'euforia-puntos');
        }
    }
}
