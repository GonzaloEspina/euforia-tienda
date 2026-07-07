<?php

if (!defined('ABSPATH')) {
    exit;
}

class Euforia_Puntos_Settings {
    public static function init(): void {
        add_action('admin_init', [__CLASS__, 'register_settings']);
    }

    public static function register_settings(): void {
        register_setting('euforia_puntos_settings', 'euforia_puntos_ars_per_point', [
            'type' => 'string',
            'sanitize_callback' => [__CLASS__, 'sanitize_positive_number'],
            'default' => '1000',
        ]);
        register_setting('euforia_puntos_settings', 'euforia_puntos_usd_per_point', [
            'type' => 'string',
            'sanitize_callback' => [__CLASS__, 'sanitize_positive_number'],
            'default' => '1',
        ]);
        register_setting('euforia_puntos_settings', 'euforia_puntos_dni_meta_keys', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'billing_wooccm11,_billing_wooccm11,billing_dni,_billing_dni,dni,DNI',
        ]);
        register_setting('euforia_puntos_settings', 'euforia_puntos_order_statuses', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'completed',
        ]);
    }

    public static function sanitize_positive_number($value): string {
        $num = (float) str_replace(',', '.', (string) $value);
        return $num > 0 ? (string) $num : '1';
    }

    public static function ars_per_point(): float {
        return max(0.01, (float) get_option('euforia_puntos_ars_per_point', 1000));
    }

    public static function usd_per_point(): float {
        return max(0.01, (float) get_option('euforia_puntos_usd_per_point', 1));
    }

    public static function order_statuses(): array {
        $raw = (string) get_option('euforia_puntos_order_statuses', 'completed');
        $statuses = array_filter(array_map('trim', explode(',', $raw)));
        return $statuses ?: ['completed'];
    }

    public static function calculate_points_from_amount(float $amount, string $currency): int {
        if ($amount <= 0) {
            return 0;
        }
        $currency = strtoupper($currency);
        if ($currency === 'USD') {
            return (int) floor($amount / self::usd_per_point());
        }
        return (int) floor($amount / self::ars_per_point());
    }
}
