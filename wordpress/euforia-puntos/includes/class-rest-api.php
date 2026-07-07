<?php

if (!defined('ABSPATH')) {
    exit;
}

class Euforia_Puntos_REST_API {
    public static function init(): void {
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }

    public static function register_routes(): void {
        register_rest_route('euforia-puntos/v1', '/balance', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_balance'],
            'permission_callback' => '__return_true',
            'args' => [
                'dni' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            ],
        ]);

        register_rest_route('euforia-puntos/v1', '/rewards', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_rewards'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('euforia-puntos/v1', '/redeem', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'redeem'],
            'permission_callback' => [__CLASS__, 'can_redeem'],
            'args' => [
                'dni' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
                'reward_id' => ['required' => true, 'type' => 'integer'],
            ],
        ]);

        register_rest_route('euforia-puntos/v1', '/history', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_history'],
            'permission_callback' => '__return_true',
            'args' => [
                'dni' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            ],
        ]);

        register_rest_route('euforia-puntos/v1', '/me', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_me'],
            'permission_callback' => '__return_true',
            'args' => [
                'return_to' => [
                    'required' => false,
                    'sanitize_callback' => 'esc_url_raw',
                ],
            ],
        ]);
    }

    public static function can_redeem(WP_REST_Request $request): bool {
        $nonce = $request->get_header('X-WP-Nonce');
        if ($nonce && wp_verify_nonce($nonce, 'wp_rest')) {
            return true;
        }
        return is_user_logged_in();
    }

    public static function get_balance(WP_REST_Request $request): WP_REST_Response {
        $dni = Euforia_Puntos_DNI::normalize($request->get_param('dni'));
        if (!$dni) {
            return new WP_REST_Response(['message' => __('DNI inválido', 'euforia-puntos')], 400);
        }

        $balance = Euforia_Puntos_Database::get_balance($dni);
        $settings = [
            'ars_per_point' => Euforia_Puntos_Settings::ars_per_point(),
            'usd_per_point' => Euforia_Puntos_Settings::usd_per_point(),
        ];

        return new WP_REST_Response([
            'dni' => $dni,
            'balance' => $balance,
            'settings' => $settings,
        ]);
    }

    public static function get_rewards(): WP_REST_Response {
        $rewards = Euforia_Puntos_Rewards::list_all(true);
        $public = array_map([Euforia_Puntos_Rewards::class, 'public_summary'], $rewards);
        return new WP_REST_Response(['rewards' => $public]);
    }

    public static function redeem(WP_REST_Request $request): WP_REST_Response {
        $dni = Euforia_Puntos_DNI::normalize($request->get_param('dni'));
        $reward_id = (int) $request->get_param('reward_id');

        if (!$dni) {
            return new WP_REST_Response(['message' => __('DNI inválido', 'euforia-puntos')], 400);
        }

        if (is_user_logged_in()) {
            $user_dni = Euforia_Puntos_DNI::from_user(get_current_user_id());
            if ($user_dni && $user_dni !== $dni) {
                return new WP_REST_Response(['message' => __('El DNI no coincide con tu cuenta.', 'euforia-puntos')], 403);
            }
        }

        $result = Euforia_Puntos_Points_Engine::redeem($dni, $reward_id);
        $status = $result['success'] ? 200 : 400;
        return new WP_REST_Response($result, $status);
    }

    public static function get_history(WP_REST_Request $request): WP_REST_Response {
        $dni = Euforia_Puntos_DNI::normalize($request->get_param('dni'));
        if (!$dni) {
            return new WP_REST_Response(['message' => __('DNI inválido', 'euforia-puntos')], 400);
        }

        $entries = Euforia_Puntos_Database::get_ledger($dni, 30);
        return new WP_REST_Response(['history' => $entries]);
    }

    public static function get_me(WP_REST_Request $request): WP_REST_Response {
        unset($request);

        $user_id = self::resolve_current_user_id();
        if (!$user_id) {
            return new WP_REST_Response(['logged_in' => false], 401);
        }

        $user = get_userdata($user_id);
        if (!$user) {
            return new WP_REST_Response(['logged_in' => false], 401);
        }

        $dni = Euforia_Puntos_DNI::from_user($user_id);
        $return_to = $request->get_param('return_to');
        if (!$return_to) {
            $return_to = home_url('/tienda/mi-cuenta');
        }

        return new WP_REST_Response([
            'logged_in' => true,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'dni' => $dni,
            'logout_url' => wp_logout_url($return_to),
        ]);
    }

    private static function resolve_current_user_id(): int {
        if (is_user_logged_in()) {
            return (int) get_current_user_id();
        }

        $validated = wp_validate_auth_cookie('', 'logged_in');
        if ($validated) {
            wp_set_current_user((int) $validated);
            return (int) $validated;
        }

        return 0;
    }
}
