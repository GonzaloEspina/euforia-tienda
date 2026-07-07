<?php

if (!defined('ABSPATH')) {
    exit;
}

class Euforia_Puntos_WooCommerce_Account {
    public const ENDPOINT = 'mis-puntos';

    public static function init(): void {
        add_action('init', [__CLASS__, 'register_endpoint']);
        add_filter('woocommerce_get_query_vars', [__CLASS__, 'register_query_var']);
        add_filter('woocommerce_account_menu_items', [__CLASS__, 'menu_items']);
        add_action('woocommerce_account_' . self::ENDPOINT . '_endpoint', [__CLASS__, 'render_endpoint']);
    }

    public static function register_endpoint(): void {
        add_rewrite_endpoint(self::ENDPOINT, EP_ROOT | EP_PAGES);
    }

    public static function register_query_var(array $vars): array {
        $vars[self::ENDPOINT] = self::ENDPOINT;
        return $vars;
    }

    public static function menu_items(array $items): array {
        $updated = [];
        foreach ($items as $key => $label) {
            $updated[$key] = $label;
            if ($key === 'dashboard') {
                $updated[self::ENDPOINT] = __('Mis puntos', 'euforia-puntos');
            }
        }

        if (!isset($updated[self::ENDPOINT])) {
            $updated[self::ENDPOINT] = __('Mis puntos', 'euforia-puntos');
        }

        return $updated;
    }

    public static function render_endpoint(): void {
        echo Euforia_Puntos_Frontend::render_shortcode([
            'title' => __('Mis puntos Euforia', 'euforia-puntos'),
        ]);
    }
}
