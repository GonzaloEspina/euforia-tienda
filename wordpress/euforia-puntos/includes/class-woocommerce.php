<?php

if (!defined('ABSPATH')) {
    exit;
}

class Euforia_Puntos_WooCommerce {
    public static function init(): void {
        add_action('woocommerce_order_status_changed', [__CLASS__, 'maybe_credit_order'], 10, 4);
        add_action('woocommerce_checkout_update_order_meta', [__CLASS__, 'persist_billing_dni'], 10, 2);
        add_action('woocommerce_admin_order_data_after_billing_address', [__CLASS__, 'show_order_points_note']);
        add_action('woocommerce_checkout_process', [__CLASS__, 'validate_checkout_dni']);
    }

    public static function validate_checkout_dni(): void {
        $key = Euforia_Puntos_DNI::checkout_field_key();
        $raw = isset($_POST[$key])
            ? sanitize_text_field(wp_unslash($_POST[$key]))
            : '';
        if (!Euforia_Puntos_DNI::normalize($raw)) {
            wc_add_notice(
                __('Ingresá un DNI válido para acumular puntos Euforia.', 'euforia-puntos'),
                'error'
            );
        }
    }

    public static function maybe_credit_order($order_id, $old_status, $new_status, $order): void {
        unset($old_status);
        if (!$order instanceof WC_Order) {
            $order = wc_get_order($order_id);
        }
        if (!$order) {
            return;
        }

        $eligible = Euforia_Puntos_Settings::order_statuses();
        if (!in_array($new_status, $eligible, true)) {
            return;
        }

        Euforia_Puntos_Points_Engine::credit_order($order);
    }

    public static function persist_billing_dni($order_id, $data): void {
        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }

        $field = Euforia_Puntos_DNI::checkout_field_key();
        $dni = null;

        if (!empty($data[$field])) {
            $dni = Euforia_Puntos_DNI::normalize((string) $data[$field]);
        }
        if (!$dni && !empty($_POST[$field])) {
            $dni = Euforia_Puntos_DNI::normalize(
                sanitize_text_field(wp_unslash($_POST[$field]))
            );
        }
        if (!$dni) {
            $dni = Euforia_Puntos_DNI::from_order($order);
        }

        if ($dni) {
            $order->update_meta_data($field, $dni);
            $order->update_meta_data('_' . $field, $dni);
            $order->update_meta_data('_euforia_puntos_dni', $dni);
            $order->save();

            $user_id = $order->get_user_id();
            if ($user_id) {
                update_user_meta($user_id, $field, $dni);
            }
        }
    }

    public static function show_order_points_note(WC_Order $order): void {
        $points = $order->get_meta('_euforia_puntos_credited');
        $dni = $order->get_meta('_euforia_puntos_dni');
        if ($points) {
            echo '<p><strong>' . esc_html__('Euforia Puntos', 'euforia-puntos') . ':</strong> ';
            echo esc_html(sprintf(__('%d puntos acreditados (DNI %s)', 'euforia-puntos'), (int) $points, $dni));
            echo '</p>';
        }
    }
}
