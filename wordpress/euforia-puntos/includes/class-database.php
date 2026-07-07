<?php

if (!defined('ABSPATH')) {
    exit;
}

class Euforia_Puntos_Database {
    public static function accounts_table(): string {
        global $wpdb;
        return $wpdb->prefix . 'euforia_puntos_accounts';
    }

    public static function ledger_table(): string {
        global $wpdb;
        return $wpdb->prefix . 'euforia_puntos_ledger';
    }

    public static function rewards_table(): string {
        global $wpdb;
        return $wpdb->prefix . 'euforia_puntos_rewards';
    }

    public static function redemptions_table(): string {
        global $wpdb;
        return $wpdb->prefix . 'euforia_puntos_redemptions';
    }

    public static function get_account(string $dni): ?array {
        global $wpdb;
        $row = $wpdb->get_row(
            $wpdb->prepare(
                'SELECT * FROM ' . self::accounts_table() . ' WHERE dni = %s',
                $dni
            ),
            ARRAY_A
        );
        return $row ?: null;
    }

    public static function get_or_create_account(string $dni, ?int $user_id = null): array {
        $account = self::get_account($dni);
        if ($account) {
            if ($user_id && empty($account['user_id'])) {
                global $wpdb;
                $wpdb->update(
                    self::accounts_table(),
                    ['user_id' => $user_id],
                    ['dni' => $dni],
                    ['%d'],
                    ['%s']
                );
                $account['user_id'] = $user_id;
            }
            return $account;
        }

        global $wpdb;
        $wpdb->insert(
            self::accounts_table(),
            [
                'dni' => $dni,
                'balance' => 0,
                'user_id' => $user_id,
            ],
            ['%s', '%d', '%d']
        );

        return self::get_account($dni) ?: [
            'dni' => $dni,
            'balance' => 0,
            'user_id' => $user_id,
        ];
    }

    public static function get_balance(string $dni): int {
        $account = self::get_account($dni);
        return $account ? (int) $account['balance'] : 0;
    }

    public static function add_ledger_entry(array $data): int {
        global $wpdb;
        $wpdb->insert(self::ledger_table(), [
            'dni' => $data['dni'],
            'type' => $data['type'],
            'points' => $data['points'],
            'balance_after' => $data['balance_after'],
            'order_id' => $data['order_id'] ?? null,
            'reward_id' => $data['reward_id'] ?? null,
            'redemption_id' => $data['redemption_id'] ?? null,
            'note' => $data['note'] ?? null,
        ], ['%s', '%s', '%d', '%d', '%d', '%d', '%d', '%s']);

        return (int) $wpdb->insert_id;
    }

    public static function get_ledger(string $dni, int $limit = 20): array {
        global $wpdb;
        return $wpdb->get_results(
            $wpdb->prepare(
                'SELECT * FROM ' . self::ledger_table() . ' WHERE dni = %s ORDER BY created_at DESC, id DESC LIMIT %d',
                $dni,
                $limit
            ),
            ARRAY_A
        ) ?: [];
    }

    public static function order_already_credited(int $order_id): bool {
        global $wpdb;
        $count = (int) $wpdb->get_var(
            $wpdb->prepare(
                'SELECT COUNT(*) FROM ' . self::ledger_table() . ' WHERE order_id = %d AND type = %s',
                $order_id,
                'earn'
            )
        );
        return $count > 0;
    }
}
