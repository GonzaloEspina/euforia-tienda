<?php

if (!defined('ABSPATH')) {
    exit;
}

class Euforia_Puntos_DNI {
    /** Campo DNI del checkout (WooCommerce Checkout Manager). */
    public const CHECKOUT_FIELD = 'billing_wooccm11';

    /**
     * Normaliza DNI argentino: solo dígitos, sin ceros a la izquierda excesivos.
     */
    public static function normalize(?string $dni): ?string {
        if ($dni === null || $dni === '') {
            return null;
        }
        $digits = preg_replace('/\D+/', '', $dni);
        if ($digits === '' || strlen($digits) < 6 || strlen($digits) > 10) {
            return null;
        }
        return ltrim($digits, '0') ?: '0';
    }

    public static function checkout_field_key(): string {
        return self::CHECKOUT_FIELD;
    }

    public static function get_meta_keys(): array {
        $default = 'billing_wooccm11,_billing_wooccm11,billing_dni,_billing_dni,dni,DNI';
        $raw = get_option('euforia_puntos_dni_meta_keys', $default);
        $keys = array_filter(array_map('trim', explode(',', (string) $raw)));
        return $keys ?: [self::CHECKOUT_FIELD, '_billing_wooccm11'];
    }

    /**
     * @param WC_Order|int $order
     */
    public static function from_order($order): ?string {
        if (is_numeric($order)) {
            $order = wc_get_order($order);
        }
        if (!$order instanceof WC_Order) {
            return null;
        }

        foreach (self::get_meta_keys() as $key) {
            $value = $order->get_meta($key);
            if (!$value) {
                $value = $order->get_meta('_' . ltrim($key, '_'));
            }
            $normalized = self::normalize((string) $value);
            if ($normalized) {
                return $normalized;
            }
        }

        return null;
    }

  /**
   * @param WP_User|int $user
   */
    public static function from_user($user): ?string {
        if (is_numeric($user)) {
            $user = get_user_by('id', $user);
        }
        if (!$user instanceof WP_User) {
            return null;
        }

        foreach (self::get_meta_keys() as $key) {
            $normalized = self::normalize((string) get_user_meta($user->ID, $key, true));
            if ($normalized) {
                return $normalized;
            }
        }

        return null;
    }
}
