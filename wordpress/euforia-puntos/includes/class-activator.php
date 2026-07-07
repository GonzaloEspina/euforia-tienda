<?php

if (!defined('ABSPATH')) {
    exit;
}

class Euforia_Puntos_Activator {
    public static function activate(): void {
        self::create_tables();
        self::seed_defaults();
        flush_rewrite_rules();
    }

    public static function deactivate(): void {
        flush_rewrite_rules();
    }

    private static function create_tables(): void {
        global $wpdb;
        $charset = $wpdb->get_charset_collate();
        $accounts = $wpdb->prefix . 'euforia_puntos_accounts';
        $ledger = $wpdb->prefix . 'euforia_puntos_ledger';
        $rewards = $wpdb->prefix . 'euforia_puntos_rewards';
        $redemptions = $wpdb->prefix . 'euforia_puntos_redemptions';

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        dbDelta("CREATE TABLE {$accounts} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            dni varchar(20) NOT NULL,
            balance int(11) NOT NULL DEFAULT 0,
            user_id bigint(20) unsigned DEFAULT NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY dni (dni),
            KEY user_id (user_id)
        ) {$charset};");

        dbDelta("CREATE TABLE {$ledger} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            dni varchar(20) NOT NULL,
            type varchar(20) NOT NULL,
            points int(11) NOT NULL,
            balance_after int(11) NOT NULL,
            order_id bigint(20) unsigned DEFAULT NULL,
            reward_id bigint(20) unsigned DEFAULT NULL,
            redemption_id bigint(20) unsigned DEFAULT NULL,
            note text DEFAULT NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY dni (dni),
            KEY order_id (order_id),
            KEY type (type)
        ) {$charset};");

        dbDelta("CREATE TABLE {$rewards} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text DEFAULT NULL,
            reward_type varchar(32) NOT NULL,
            config longtext DEFAULT NULL,
            points_cost int(11) NOT NULL,
            enabled tinyint(1) NOT NULL DEFAULT 1,
            sort_order int(11) NOT NULL DEFAULT 0,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY enabled (enabled),
            KEY sort_order (sort_order)
        ) {$charset};");

        dbDelta("CREATE TABLE {$redemptions} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            dni varchar(20) NOT NULL,
            reward_id bigint(20) unsigned NOT NULL,
            points_spent int(11) NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'completed',
            coupon_code varchar(50) DEFAULT NULL,
            meta longtext DEFAULT NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY dni (dni),
            KEY reward_id (reward_id),
            KEY status (status)
        ) {$charset};");

        update_option('euforia_puntos_db_version', EUFORIA_PUNTOS_VERSION);
    }

    private static function seed_defaults(): void {
        if (get_option('euforia_puntos_ars_per_point') === false) {
            update_option('euforia_puntos_ars_per_point', '1000');
        }
        if (get_option('euforia_puntos_usd_per_point') === false) {
            update_option('euforia_puntos_usd_per_point', '1');
        }
        if (get_option('euforia_puntos_dni_meta_keys') === false) {
            update_option(
                'euforia_puntos_dni_meta_keys',
                'billing_wooccm11,_billing_wooccm11,billing_dni,_billing_dni,dni,DNI'
            );
        }
        if (get_option('euforia_puntos_order_statuses') === false) {
            update_option('euforia_puntos_order_statuses', 'completed');
        }
    }
}
