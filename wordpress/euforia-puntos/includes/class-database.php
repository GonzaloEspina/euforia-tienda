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

    /**
     * @param array{type?:string,dni?:string,search?:string,page?:int,per_page?:int} $args
     */
    public static function query_ledger(array $args = []): array {
        global $wpdb;
        $table = self::ledger_table();
        $where = ['1=1'];
        $params = [];

        if (!empty($args['type'])) {
            $where[] = 'type = %s';
            $params[] = sanitize_key($args['type']);
        }

        if (!empty($args['dni'])) {
            $dni = Euforia_Puntos_DNI::normalize((string) $args['dni']);
            if ($dni) {
                $where[] = 'dni = %s';
                $params[] = $dni;
            }
        }

        if (!empty($args['search'])) {
            $like = '%' . $wpdb->esc_like((string) $args['search']) . '%';
            $where[] = '(dni LIKE %s OR note LIKE %s)';
            $params[] = $like;
            $params[] = $like;
        }

        $page = max(1, (int) ($args['page'] ?? 1));
        $per_page = min(100, max(10, (int) ($args['per_page'] ?? 25)));
        $offset = ($page - 1) * $per_page;

        $sql = 'SELECT * FROM ' . $table . ' WHERE ' . implode(' AND ', $where)
            . ' ORDER BY created_at DESC, id DESC LIMIT %d OFFSET %d';
        $params[] = $per_page;
        $params[] = $offset;

        if ($params) {
            return $wpdb->get_results($wpdb->prepare($sql, ...$params), ARRAY_A) ?: [];
        }

        return $wpdb->get_results($sql, ARRAY_A) ?: [];
    }

    /**
     * @param array{type?:string,dni?:string,search?:string} $args
     */
    public static function count_ledger(array $args = []): int {
        global $wpdb;
        $table = self::ledger_table();
        $where = ['1=1'];
        $params = [];

        if (!empty($args['type'])) {
            $where[] = 'type = %s';
            $params[] = sanitize_key($args['type']);
        }

        if (!empty($args['dni'])) {
            $dni = Euforia_Puntos_DNI::normalize((string) $args['dni']);
            if ($dni) {
                $where[] = 'dni = %s';
                $params[] = $dni;
            }
        }

        if (!empty($args['search'])) {
            $like = '%' . $wpdb->esc_like((string) $args['search']) . '%';
            $where[] = '(dni LIKE %s OR note LIKE %s)';
            $params[] = $like;
            $params[] = $like;
        }

        $sql = 'SELECT COUNT(*) FROM ' . $table . ' WHERE ' . implode(' AND ', $where);
        if ($params) {
            return (int) $wpdb->get_var($wpdb->prepare($sql, ...$params));
        }

        return (int) $wpdb->get_var($sql);
    }

    public static function get_redemptions(string $dni, int $limit = 50): array {
        global $wpdb;
        $redemptions = self::redemptions_table();
        $rewards = self::rewards_table();

        Euforia_Puntos_Redemptions::expire_stale();

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                'SELECT r.*, rw.title AS reward_title
                FROM ' . $redemptions . ' r
                LEFT JOIN ' . $rewards . ' rw ON rw.id = r.reward_id
                WHERE r.dni = %s
                ORDER BY r.created_at DESC, r.id DESC
                LIMIT %d',
                $dni,
                $limit
            ),
            ARRAY_A
        ) ?: [];

        return array_map(static function (array $row): array {
            return Euforia_Puntos_Redemptions::sync_redemption_status($row);
        }, $rows);
    }

    public static function get_passenger_profile(string $dni): ?array {
        $account = self::get_account($dni);
        if (!$account) {
            return null;
        }

        $profile = [
            'dni' => $dni,
            'balance' => (int) $account['balance'],
            'user_id' => $account['user_id'] ? (int) $account['user_id'] : null,
            'name' => null,
            'email' => null,
        ];

        if ($profile['user_id']) {
            $user = get_userdata($profile['user_id']);
            if ($user) {
                $profile['name'] = $user->display_name;
                $profile['email'] = $user->user_email;
            }
        }

        return $profile;
    }
}
