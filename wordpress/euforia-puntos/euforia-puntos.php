<?php
/**
 * Plugin Name: Euforia Puntos
 * Description: Programa de puntos por compras WooCommerce. Canje de premios y descuentos vinculado por DNI.
 * Version: 1.0.6
 * Author: Gonzalo Espina
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * WC requires at least: 7.0
 * Text Domain: euforia-puntos
 */

if (!defined('ABSPATH')) {
    exit;
}

define('EUFORIA_PUNTOS_VERSION', '1.0.6');
define('EUFORIA_PUNTOS_PLUGIN_FILE', __FILE__);
define('EUFORIA_PUNTOS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('EUFORIA_PUNTOS_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once EUFORIA_PUNTOS_PLUGIN_DIR . 'includes/class-activator.php';
require_once EUFORIA_PUNTOS_PLUGIN_DIR . 'includes/class-database.php';
require_once EUFORIA_PUNTOS_PLUGIN_DIR . 'includes/class-dni.php';
require_once EUFORIA_PUNTOS_PLUGIN_DIR . 'includes/class-settings.php';
require_once EUFORIA_PUNTOS_PLUGIN_DIR . 'includes/class-rewards.php';
require_once EUFORIA_PUNTOS_PLUGIN_DIR . 'includes/class-redemptions.php';
require_once EUFORIA_PUNTOS_PLUGIN_DIR . 'includes/class-points-engine.php';
require_once EUFORIA_PUNTOS_PLUGIN_DIR . 'includes/class-woocommerce.php';
require_once EUFORIA_PUNTOS_PLUGIN_DIR . 'includes/class-woocommerce-account.php';
require_once EUFORIA_PUNTOS_PLUGIN_DIR . 'includes/class-rest-api.php';
require_once EUFORIA_PUNTOS_PLUGIN_DIR . 'includes/class-admin.php';
require_once EUFORIA_PUNTOS_PLUGIN_DIR . 'includes/class-frontend.php';

register_activation_hook(__FILE__, ['Euforia_Puntos_Activator', 'activate']);
register_deactivation_hook(__FILE__, ['Euforia_Puntos_Activator', 'deactivate']);

final class Euforia_Puntos_Plugin {
    private static $instance = null;

    public static function instance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('plugins_loaded', [$this, 'init']);
    }

    public function init(): void {
        load_plugin_textdomain('euforia-puntos', false, dirname(plugin_basename(__FILE__)) . '/languages');

        if (!class_exists('WooCommerce')) {
            add_action('admin_notices', [$this, 'woocommerce_missing_notice']);
            return;
        }

        self::maybe_migrate_dni_field();
        self::maybe_migrate_redemptions();

        Euforia_Puntos_Settings::init();
        Euforia_Puntos_Rewards::init();
        Euforia_Puntos_Redemptions::init();
        Euforia_Puntos_Points_Engine::init();
        Euforia_Puntos_WooCommerce::init();
        Euforia_Puntos_WooCommerce_Account::init();
        Euforia_Puntos_REST_API::init();
        Euforia_Puntos_Admin::init();
        Euforia_Puntos_Frontend::init();
    }

    private static function maybe_migrate_redemptions(): void {
        $version = get_option('euforia_puntos_db_version', '1.0.0');
        if (version_compare($version, '1.0.6', '>=')) {
            return;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'euforia_puntos_redemptions';
        $columns = $wpdb->get_col("DESC {$table}", 0);

        if (!in_array('expires_at', $columns, true)) {
            $wpdb->query("ALTER TABLE {$table} ADD COLUMN expires_at datetime DEFAULT NULL AFTER status");
        }
        if (!in_array('used_at', $columns, true)) {
            $wpdb->query("ALTER TABLE {$table} ADD COLUMN used_at datetime DEFAULT NULL AFTER expires_at");
        }

        update_option('euforia_puntos_db_version', EUFORIA_PUNTOS_VERSION);
    }

    private static function maybe_migrate_dni_field(): void {
        $keys = (string) get_option('euforia_puntos_dni_meta_keys', '');
        if ($keys !== '' && strpos($keys, 'billing_wooccm11') === false) {
            update_option(
                'euforia_puntos_dni_meta_keys',
                'billing_wooccm11,_billing_wooccm11,' . $keys
            );
        }
    }

    public function woocommerce_missing_notice(): void {
        echo '<div class="notice notice-error"><p>';
        esc_html_e('Euforia Puntos requiere WooCommerce activo.', 'euforia-puntos');
        echo '</p></div>';
    }
}

Euforia_Puntos_Plugin::instance();
