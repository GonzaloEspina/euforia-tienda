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

        register_rest_route('euforia-puntos/v1', '/login', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'login'],
            'permission_callback' => '__return_true',
            'args' => [
                'username' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'password' => [
                    'required' => true,
                ],
                'return_to' => [
                    'required' => false,
                    'sanitize_callback' => 'esc_url_raw',
                ],
            ],
        ]);

        register_rest_route('euforia-puntos/v1', '/orders', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_orders'],
            'permission_callback' => [__CLASS__, 'require_logged_in'],
            'args' => [
                'page' => [
                    'required' => false,
                    'type' => 'integer',
                    'default' => 1,
                ],
                'per_page' => [
                    'required' => false,
                    'type' => 'integer',
                    'default' => 20,
                ],
            ],
        ]);

        register_rest_route('euforia-puntos/v1', '/redemptions', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_redemptions'],
            'permission_callback' => [__CLASS__, 'require_logged_in'],
            'args' => [
                'dni' => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            ],
        ]);

        register_rest_route('euforia-puntos/v1', '/account', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'update_account'],
            'permission_callback' => [__CLASS__, 'require_logged_in'],
        ]);
    }

    public static function require_logged_in(): bool {
        return self::resolve_current_user_id() > 0;
    }

    public static function can_redeem(WP_REST_Request $request): bool {
        $nonce = $request->get_header('X-WP-Nonce');
        if ($nonce && wp_verify_nonce($nonce, 'wp_rest')) {
            return true;
        }
        return self::resolve_current_user_id() > 0;
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

        if (self::resolve_current_user_id()) {
            $user_dni = Euforia_Puntos_DNI::from_user(self::resolve_current_user_id());
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

        $billing = self::get_customer_billing($user_id);

        return new WP_REST_Response([
            'logged_in' => true,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'dni' => $dni,
            'logout_url' => wp_logout_url($return_to),
            'billing' => $billing,
        ]);
    }

    public static function get_orders(WP_REST_Request $request): WP_REST_Response {
        $user_id = self::resolve_current_user_id();
        if (!$user_id) {
            return new WP_REST_Response(['message' => __('No autenticado.', 'euforia-puntos')], 401);
        }

        $page = max(1, (int) $request->get_param('page'));
        $per_page = min(50, max(1, (int) $request->get_param('per_page')));

        $result = wc_get_orders([
            'customer_id' => $user_id,
            'limit' => $per_page,
            'page' => $page,
            'paginate' => true,
            'orderby' => 'date',
            'order' => 'DESC',
        ]);

        $orders = [];
        foreach ($result->orders as $order) {
            if (!$order instanceof WC_Order) {
                continue;
            }
            $orders[] = self::format_order($order);
        }

        return new WP_REST_Response([
            'orders' => $orders,
            'total' => (int) $result->total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => (int) $result->max_num_pages,
        ]);
    }

    private static function format_order(WC_Order $order): array {
        $items = [];
        foreach ($order->get_items() as $item) {
            if (!$item instanceof WC_Order_Item_Product) {
                continue;
            }
            $product = $item->get_product();
            $items[] = [
                'name' => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'total' => wc_format_decimal($item->get_total(), 2),
                'image' => $product ? wp_get_attachment_image_url($product->get_image_id(), 'thumbnail') : null,
            ];
        }

        $date = $order->get_date_created();

        return [
            'id' => $order->get_id(),
            'number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'status_label' => wc_get_order_status_name($order->get_status()),
            'date' => $date ? $date->date('c') : null,
            'total' => wc_format_decimal($order->get_total(), 2),
            'currency' => $order->get_currency(),
            'currency_symbol' => get_woocommerce_currency_symbol($order->get_currency()),
            'item_count' => $order->get_item_count(),
            'items' => $items,
            'payment_method' => $order->get_payment_method_title(),
            'billing' => [
                'first_name' => $order->get_billing_first_name(),
                'last_name' => $order->get_billing_last_name(),
                'email' => $order->get_billing_email(),
                'phone' => $order->get_billing_phone(),
                'address_1' => $order->get_billing_address_1(),
                'address_2' => $order->get_billing_address_2(),
                'city' => $order->get_billing_city(),
                'state' => $order->get_billing_state(),
                'postcode' => $order->get_billing_postcode(),
                'country' => $order->get_billing_country(),
            ],
        ];
    }

    private static function get_customer_billing(int $user_id): array {
        if (!function_exists('WC_Customer')) {
            return [];
        }

        $customer = new WC_Customer($user_id);
        $user = get_userdata($user_id);

        $first_name = $customer->get_billing_first_name()
            ?: $customer->get_first_name()
            ?: ($user ? $user->first_name : '');
        $last_name = $customer->get_billing_last_name()
            ?: $customer->get_last_name()
            ?: ($user ? $user->last_name : '');

        if ($first_name === '' && $last_name === '' && $user && $user->display_name) {
            $parts = preg_split('/\s+/', trim($user->display_name), 2);
            $first_name = $parts[0] ?? '';
            $last_name = $parts[1] ?? '';
        }

        $phone = $customer->get_billing_phone()
            ?: get_user_meta($user_id, 'billing_phone', true)
            ?: get_user_meta($user_id, 'phone', true);

        $city = $customer->get_billing_city() ?: $customer->get_shipping_city();
        $state = $customer->get_billing_state() ?: $customer->get_shipping_state();

        return [
            'first_name' => (string) $first_name,
            'last_name' => (string) $last_name,
            'email' => $customer->get_email(),
            'phone' => (string) $phone,
            'address_1' => $customer->get_billing_address_1() ?: $customer->get_shipping_address_1(),
            'address_2' => $customer->get_billing_address_2() ?: $customer->get_shipping_address_2(),
            'city' => (string) $city,
            'state' => (string) $state,
            'postcode' => $customer->get_billing_postcode() ?: $customer->get_shipping_postcode(),
            'country' => $customer->get_billing_country() ?: $customer->get_shipping_country() ?: 'AR',
        ];
    }

    public static function get_redemptions(WP_REST_Request $request): WP_REST_Response {
        $user_id = self::resolve_current_user_id();
        if (!$user_id) {
            return new WP_REST_Response(['message' => __('No autenticado.', 'euforia-puntos')], 401);
        }

        $dni = Euforia_Puntos_DNI::normalize($request->get_param('dni'));
        if (!$dni) {
            return new WP_REST_Response(['message' => __('DNI inválido', 'euforia-puntos')], 400);
        }

        $user_dni = Euforia_Puntos_DNI::from_user($user_id);
        if ($user_dni && $user_dni !== $dni) {
            return new WP_REST_Response(['message' => __('El DNI no coincide con tu cuenta.', 'euforia-puntos')], 403);
        }

        $rows = Euforia_Puntos_Database::get_redemptions($dni, 50);
        $public = array_map([Euforia_Puntos_Redemptions::class, 'public_summary'], $rows);

        return new WP_REST_Response(['redemptions' => $public]);
    }

    public static function update_account(WP_REST_Request $request): WP_REST_Response {
        $user_id = self::resolve_current_user_id();
        if (!$user_id) {
            return new WP_REST_Response(['message' => __('No autenticado.', 'euforia-puntos')], 401);
        }

        $customer = new WC_Customer($user_id);

        $first_name = sanitize_text_field((string) $request->get_param('first_name'));
        $last_name = sanitize_text_field((string) $request->get_param('last_name'));
        $email = sanitize_email((string) $request->get_param('email'));
        $phone = sanitize_text_field((string) $request->get_param('phone'));
        $address_1 = sanitize_text_field((string) $request->get_param('address_1'));
        $address_2 = sanitize_text_field((string) $request->get_param('address_2'));
        $city = sanitize_text_field((string) $request->get_param('city'));
        $state = sanitize_text_field((string) $request->get_param('state'));
        $postcode = sanitize_text_field((string) $request->get_param('postcode'));
        $country = sanitize_text_field((string) $request->get_param('country'));
        $dni = $request->get_param('dni');

        if ($first_name !== '') {
            $customer->set_billing_first_name($first_name);
            $customer->set_first_name($first_name);
        }
        if ($last_name !== '') {
            $customer->set_billing_last_name($last_name);
            $customer->set_last_name($last_name);
        }
        if ($email !== '' && is_email($email)) {
            $customer->set_billing_email($email);
            $customer->set_email($email);
            wp_update_user(['ID' => $user_id, 'user_email' => $email]);
        }
        if ($phone !== '') {
            $customer->set_billing_phone($phone);
        }
        if ($address_1 !== '') {
            $customer->set_billing_address_1($address_1);
        }
        if ($address_2 !== '') {
            $customer->set_billing_address_2($address_2);
        }
        if ($city !== '') {
            $customer->set_billing_city($city);
        }
        if ($state !== '') {
            $customer->set_billing_state($state);
            $customer->set_shipping_state($state);
        }
        if ($postcode !== '') {
            $customer->set_billing_postcode($postcode);
        }
        if ($country !== '') {
            $customer->set_billing_country(strtoupper($country));
        } else {
            $customer->set_billing_country('AR');
        }

        if ($city !== '') {
            $customer->set_shipping_city($city);
        }
        if ($phone !== '') {
            $customer->set_shipping_phone($phone);
        }

        $customer->save();

        if ($dni !== null && $dni !== '') {
            Euforia_Puntos_DNI::save_to_user($user_id, (string) $dni);
        }

        wp_set_current_user($user_id);

        return self::get_me($request);
    }

    public static function login(WP_REST_Request $request): WP_REST_Response {
        $username = sanitize_text_field((string) $request->get_param('username'));
        $password = (string) $request->get_param('password');

        if ($username === '' || $password === '') {
            return new WP_REST_Response([
                'message' => __('Completá usuario y contraseña.', 'euforia-puntos'),
            ], 400);
        }

        $user = wp_signon([
            'user_login' => $username,
            'user_password' => $password,
            'remember' => true,
        ], is_ssl());

        if (is_wp_error($user)) {
            return new WP_REST_Response([
                'message' => __('Usuario o contraseña incorrectos.', 'euforia-puntos'),
            ], 401);
        }

        wp_set_current_user($user->ID);

        return self::get_me($request);
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
