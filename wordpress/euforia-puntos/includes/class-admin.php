<?php

if (!defined('ABSPATH')) {
    exit;
}

class Euforia_Puntos_Admin {
    public static function init(): void {
        add_action('admin_menu', [__CLASS__, 'register_menus']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_assets']);
    }

    public static function register_menus(): void {
        add_menu_page(
            __('Euforia Puntos', 'euforia-puntos'),
            __('Euforia Puntos', 'euforia-puntos'),
            'manage_woocommerce',
            'euforia-puntos',
            [__CLASS__, 'render_settings_page'],
            'dashicons-awards',
            56
        );

        add_submenu_page(
            'euforia-puntos',
            __('Configuración', 'euforia-puntos'),
            __('Configuración', 'euforia-puntos'),
            'manage_woocommerce',
            'euforia-puntos',
            [__CLASS__, 'render_settings_page']
        );

        add_submenu_page(
            'euforia-puntos',
            __('Premios', 'euforia-puntos'),
            __('Premios', 'euforia-puntos'),
            'manage_woocommerce',
            'euforia-puntos-rewards',
            [__CLASS__, 'render_rewards_page']
        );

        add_submenu_page(
            'euforia-puntos',
            __('Gestión de puntos', 'euforia-puntos'),
            __('Gestión de puntos', 'euforia-puntos'),
            'manage_woocommerce',
            'euforia-puntos-manage',
            [__CLASS__, 'render_points_manage_page']
        );
    }

    public static function enqueue_assets(string $hook): void {
        $page = isset($_GET['page']) ? sanitize_key(wp_unslash($_GET['page'])) : '';
        $is_plugin_screen = strpos($hook, 'euforia-puntos') !== false
            || strpos($page, 'euforia-puntos') === 0;

        if (!$is_plugin_screen) {
            return;
        }

        wp_enqueue_style(
            'euforia-puntos-admin',
            EUFORIA_PUNTOS_PLUGIN_URL . 'assets/css/admin.css',
            [],
            EUFORIA_PUNTOS_VERSION
        );

        $is_rewards_screen = strpos($hook, 'euforia-puntos-rewards') !== false
            || $page === 'euforia-puntos-rewards';

        $script_deps = ['jquery'];
        if ($is_rewards_screen) {
            wp_enqueue_media();
            $script_deps[] = 'media-editor';
        }

        wp_enqueue_script(
            'euforia-puntos-admin',
            EUFORIA_PUNTOS_PLUGIN_URL . 'assets/js/admin.js',
            $script_deps,
            EUFORIA_PUNTOS_VERSION,
            true
        );

        if ($is_rewards_screen) {
            wp_localize_script('euforia-puntos-admin', 'euforiaPuntosAdmin', [
                'rewardsScreen' => true,
                'mediaError' => __(
                    'No se pudo abrir la biblioteca de medios. Recargá la página o probá desde el escritorio de WordPress.',
                    'euforia-puntos'
                ),
            ]);
        }
    }

    public static function render_settings_page(): void {
        if (!current_user_can('manage_woocommerce')) {
            return;
        }
        include EUFORIA_PUNTOS_PLUGIN_DIR . 'templates/admin-settings.php';
    }

    public static function render_rewards_page(): void {
        if (!current_user_can('manage_woocommerce')) {
            return;
        }

        if (isset($_POST['euforia_puntos_reward_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['euforia_puntos_reward_nonce'])), 'euforia_puntos_save_reward')) {
            self::handle_reward_save();
        }

        if (isset($_GET['action'], $_GET['reward_id'], $_GET['_wpnonce'])) {
            self::handle_reward_action();
        }

        include EUFORIA_PUNTOS_PLUGIN_DIR . 'templates/admin-rewards.php';
    }

    public static function render_points_manage_page(): void {
        if (!current_user_can('manage_woocommerce')) {
            return;
        }

        $message = '';
        $message_type = 'success';

        if (isset($_GET['action'], $_GET['redemption_id'], $_GET['_wpnonce'])
            && $_GET['action'] === 'fulfill_redemption'
            && wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'euforia_fulfill_redemption')
        ) {
            $result = Euforia_Puntos_Redemptions::mark_fulfilled((int) $_GET['redemption_id']);
            if ($result['success']) {
                $message = __('Canje marcado como entregado/usado.', 'euforia-puntos');
            } else {
                $message_type = 'error';
                $message = __('No se pudo actualizar el canje.', 'euforia-puntos');
            }
        }

        if (isset($_POST['euforia_puntos_adjust_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['euforia_puntos_adjust_nonce'])), 'euforia_puntos_adjust')) {
            $dni = Euforia_Puntos_DNI::normalize(sanitize_text_field(wp_unslash($_POST['dni'] ?? '')));
            $points = (int) ($_POST['points'] ?? 0);
            $note = sanitize_text_field(wp_unslash($_POST['note'] ?? ''));
            $result = Euforia_Puntos_Points_Engine::manual_adjustment($dni ?? '', $points, $note);

            if ($result['success']) {
                $message = sprintf(
                    __('Saldo actualizado: %d puntos para DNI %s', 'euforia-puntos'),
                    $result['balance'],
                    $dni
                );
            } else {
                $message_type = 'error';
                $errors = [
                    'invalid_dni' => __('DNI inválido.', 'euforia-puntos'),
                    'zero_points' => __('Ingresá un valor distinto de cero.', 'euforia-puntos'),
                    'negative_balance' => __('El saldo no puede quedar negativo.', 'euforia-puntos'),
                ];
                $message = $errors[$result['message'] ?? ''] ?? __('No se pudo ajustar.', 'euforia-puntos');
            }
        }

        include EUFORIA_PUNTOS_PLUGIN_DIR . 'templates/admin-points-manage.php';
    }

    /** @deprecated Use render_points_manage_page */
    public static function render_adjust_page(): void {
        wp_safe_redirect(admin_url('admin.php?page=euforia-puntos-manage&tab=adjust'));
        exit;
    }

    private static function handle_reward_save(): void {
        $config = [];
        $type = sanitize_key($_POST['reward_type'] ?? '');

        if ($type === Euforia_Puntos_Rewards::TYPE_PERCENT) {
            $config['percent'] = min(100, max(1, (float) ($_POST['config_percent'] ?? 10)));
        } elseif ($type === Euforia_Puntos_Rewards::TYPE_FIXED) {
            $config['amount'] = max(0.01, (float) ($_POST['config_amount'] ?? 0));
            $config['currency'] = strtoupper(sanitize_text_field($_POST['config_currency'] ?? 'ARS'));
        } elseif ($type === Euforia_Puntos_Rewards::TYPE_MERCH) {
            $config['item_name'] = sanitize_text_field($_POST['config_item_name'] ?? '');
            $image_id = (int) ($_POST['config_image_id'] ?? 0);
            $image_url = esc_url_raw(wp_unslash($_POST['config_image_url'] ?? ''));
            if ($image_id) {
                $attached = wp_get_attachment_image_url($image_id, 'medium_large');
                if ($attached) {
                    $image_url = $attached;
                }
            }
            $config['image_id'] = $image_id;
            $config['image_url'] = $image_url;
        }

        $expiration_mode = sanitize_key($_POST['expiration_mode'] ?? 'none');
        if (!in_array($expiration_mode, ['none', 'fixed_date', 'relative'], true)) {
            $expiration_mode = 'none';
        }
        $config['expiration'] = [
            'mode' => $expiration_mode,
            'fixed_date' => sanitize_text_field(wp_unslash($_POST['expiration_fixed_date'] ?? '')),
            'relative_value' => max(1, (int) ($_POST['expiration_relative_value'] ?? 30)),
            'relative_unit' => in_array($_POST['expiration_relative_unit'] ?? '', ['days', 'months'], true)
                ? sanitize_key($_POST['expiration_relative_unit'])
                : 'days',
        ];

        Euforia_Puntos_Rewards::save([
            'id' => !empty($_POST['reward_id']) ? (int) $_POST['reward_id'] : 0,
            'title' => sanitize_text_field(wp_unslash($_POST['title'] ?? '')),
            'description' => sanitize_textarea_field(wp_unslash($_POST['description'] ?? '')),
            'reward_type' => $type,
            'config' => $config,
            'points_cost' => (int) ($_POST['points_cost'] ?? 1),
            'enabled' => !empty($_POST['enabled']),
            'sort_order' => (int) ($_POST['sort_order'] ?? 0),
        ]);

        wp_safe_redirect(admin_url('admin.php?page=euforia-puntos-rewards&saved=1'));
        exit;
    }

    private static function handle_reward_action(): void {
        $action = sanitize_key($_GET['action']);
        $reward_id = (int) $_GET['reward_id'];
        if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'euforia_puntos_reward_' . $reward_id)) {
            return;
        }

        if ($action === 'delete') {
            Euforia_Puntos_Rewards::delete($reward_id);
        } elseif ($action === 'toggle_on') {
            Euforia_Puntos_Rewards::toggle($reward_id, true);
        } elseif ($action === 'toggle_off') {
            Euforia_Puntos_Rewards::toggle($reward_id, false);
        }

        wp_safe_redirect(admin_url('admin.php?page=euforia-puntos-rewards'));
        exit;
    }
}
