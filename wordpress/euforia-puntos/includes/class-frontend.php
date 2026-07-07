<?php

if (!defined('ABSPATH')) {
    exit;
}

class Euforia_Puntos_Frontend {
    public static function init(): void {
        add_shortcode('euforia_mis_puntos', [__CLASS__, 'render_shortcode']);
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_assets']);
        add_action('init', [__CLASS__, 'register_block']);
    }

    public static function register_block(): void {
        // Shortcode is primary; block optional later.
    }

    public static function enqueue_assets(): void {
        if (!is_singular() && !is_page()) {
            return;
        }
        global $post;
        if (!$post || !has_shortcode($post->post_content, 'euforia_mis_puntos')) {
            return;
        }

        wp_enqueue_style(
            'euforia-puntos-public',
            EUFORIA_PUNTOS_PLUGIN_URL . 'assets/css/public.css',
            [],
            EUFORIA_PUNTOS_VERSION
        );
        wp_enqueue_script(
            'euforia-puntos-public',
            EUFORIA_PUNTOS_PLUGIN_URL . 'assets/js/public.js',
            [],
            EUFORIA_PUNTOS_VERSION,
            true
        );

        wp_localize_script('euforia-puntos-public', 'euforiaPuntos', [
            'restUrl' => esc_url_raw(rest_url('euforia-puntos/v1/')),
            'nonce' => wp_create_nonce('wp_rest'),
            'strings' => [
                'loading' => __('Cargando...', 'euforia-puntos'),
                'invalidDni' => __('Ingresá un DNI válido (6 a 10 dígitos).', 'euforia-puntos'),
                'redeemConfirm' => __('¿Confirmás el canje de este premio?', 'euforia-puntos'),
                'redeemSuccess' => __('Canje realizado.', 'euforia-puntos'),
                'redeemError' => __('No se pudo canjear.', 'euforia-puntos'),
                'yourPoints' => __('Tus puntos', 'euforia-puntos'),
                'rewardsTitle' => __('Canjeá tus puntos', 'euforia-puntos'),
                'historyTitle' => __('Historial', 'euforia-puntos'),
                'lookup' => __('Consultar', 'euforia-puntos'),
                'redeem' => __('Canjear', 'euforia-puntos'),
                'points' => __('puntos', 'euforia-puntos'),
            ],
        ]);
    }

    public static function render_shortcode($atts): string {
        $atts = shortcode_atts([
            'title' => __('Mis puntos Euforia', 'euforia-puntos'),
        ], $atts, 'euforia_mis_puntos');

        ob_start();
        $title = $atts['title'];
        $prefill_dni = '';
        if (is_user_logged_in()) {
            $prefill_dni = Euforia_Puntos_DNI::from_user(get_current_user_id()) ?? '';
        }
        include EUFORIA_PUNTOS_PLUGIN_DIR . 'templates/mis-puntos.php';
        return ob_get_clean();
    }
}
