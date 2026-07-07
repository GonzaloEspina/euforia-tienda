<?php

if (!defined('ABSPATH')) {
    exit;
}

class Euforia_Puntos_Rewards {
    public const TYPE_PERCENT = 'percent_discount';
    public const TYPE_FIXED = 'fixed_discount';
    public const TYPE_MERCH = 'merchandising';

    public static function init(): void {
        // Reserved for future hooks.
    }

    public static function types(): array {
        return [
            self::TYPE_PERCENT => __('Descuento por porcentaje en checkout', 'euforia-puntos'),
            self::TYPE_FIXED => __('Descuento por monto fijo en checkout', 'euforia-puntos'),
            self::TYPE_MERCH => __('Merchandising Euforia', 'euforia-puntos'),
        ];
    }

    public static function get(int $id): ?array {
        global $wpdb;
        $row = $wpdb->get_row(
            $wpdb->prepare('SELECT * FROM ' . Euforia_Puntos_Database::rewards_table() . ' WHERE id = %d', $id),
            ARRAY_A
        );
        return $row ? self::format_row($row) : null;
    }

    public static function list_all(bool $only_enabled = false): array {
        global $wpdb;
        $sql = 'SELECT * FROM ' . Euforia_Puntos_Database::rewards_table();
        if ($only_enabled) {
            $sql .= ' WHERE enabled = 1';
        }
        $sql .= ' ORDER BY sort_order ASC, id ASC';
        $rows = $wpdb->get_results($sql, ARRAY_A) ?: [];
        return array_map([__CLASS__, 'format_row'], $rows);
    }

    public static function save(array $data): int {
        global $wpdb;
        $config = isset($data['config']) && is_array($data['config'])
            ? wp_json_encode($data['config'])
            : (string) ($data['config'] ?? '{}');

        $fields = [
            'title' => sanitize_text_field($data['title'] ?? ''),
            'description' => sanitize_textarea_field($data['description'] ?? ''),
            'reward_type' => sanitize_key($data['reward_type'] ?? self::TYPE_PERCENT),
            'config' => $config,
            'points_cost' => max(1, (int) ($data['points_cost'] ?? 1)),
            'enabled' => !empty($data['enabled']) ? 1 : 0,
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ];

        if (empty($fields['title'])) {
            return 0;
        }

        if (!empty($data['id'])) {
            $wpdb->update(
                Euforia_Puntos_Database::rewards_table(),
                $fields,
                ['id' => (int) $data['id']],
                ['%s', '%s', '%s', '%s', '%d', '%d', '%d'],
                ['%d']
            );
            return (int) $data['id'];
        }

        $wpdb->insert(
            Euforia_Puntos_Database::rewards_table(),
            $fields,
            ['%s', '%s', '%s', '%s', '%d', '%d', '%d']
        );
        return (int) $wpdb->insert_id;
    }

    public static function delete(int $id): bool {
        global $wpdb;
        return (bool) $wpdb->delete(
            Euforia_Puntos_Database::rewards_table(),
            ['id' => $id],
            ['%d']
        );
    }

    public static function toggle(int $id, bool $enabled): bool {
        global $wpdb;
        return (bool) $wpdb->update(
            Euforia_Puntos_Database::rewards_table(),
            ['enabled' => $enabled ? 1 : 0],
            ['id' => $id],
            ['%d'],
            ['%d']
        );
    }

    public static function format_row(array $row): array {
        $config = json_decode((string) ($row['config'] ?? '{}'), true);
        if (!is_array($config)) {
            $config = [];
        }
        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'reward_type' => $row['reward_type'],
            'config' => $config,
            'points_cost' => (int) $row['points_cost'],
            'enabled' => (bool) $row['enabled'],
            'sort_order' => (int) $row['sort_order'],
            'type_label' => self::types()[$row['reward_type']] ?? $row['reward_type'],
        ];
    }

    public static function public_summary(array $reward): array {
        $visual = self::get_visual($reward);
        return [
            'id' => $reward['id'],
            'title' => $reward['title'],
            'description' => $reward['description'],
            'reward_type' => $reward['reward_type'],
            'points_cost' => $reward['points_cost'],
            'type_label' => $reward['type_label'],
            'benefit_label' => self::benefit_label($reward),
            'visual_type' => $visual['visual_type'],
            'image_url' => $visual['image_url'],
            'icon' => $visual['icon'],
            'badge_text' => $visual['badge_text'],
        ];
    }

    /**
     * Datos visuales para la tarjeta pública del premio.
     */
    public static function get_visual(array $reward): array {
        $config = $reward['config'];
        $type = $reward['reward_type'];

        if ($type === self::TYPE_MERCH) {
            $image_url = !empty($config['image_url']) ? esc_url($config['image_url']) : '';
            if (!$image_url && !empty($config['image_id'])) {
                $image_url = (string) wp_get_attachment_image_url((int) $config['image_id'], 'medium_large');
            }
            return [
                'visual_type' => $image_url ? 'image' : 'icon',
                'image_url' => $image_url,
                'icon' => 'merch',
                'badge_text' => '',
            ];
        }

        if ($type === self::TYPE_PERCENT) {
            $percent = (int) ($config['percent'] ?? 0);
            return [
                'visual_type' => 'icon',
                'image_url' => '',
                'icon' => 'percent',
                'badge_text' => $percent . '%',
            ];
        }

        if ($type === self::TYPE_FIXED) {
            $currency = strtoupper($config['currency'] ?? 'ARS');
            $amount = (float) ($config['amount'] ?? 0);
            $formatted = $currency === 'USD'
                ? 'USD ' . number_format_i18n($amount, 2)
                : '$' . number_format_i18n($amount, 0);
            return [
                'visual_type' => 'icon',
                'image_url' => '',
                'icon' => 'fixed',
                'badge_text' => $formatted,
            ];
        }

        return [
            'visual_type' => 'icon',
            'image_url' => '',
            'icon' => 'gift',
            'badge_text' => '',
        ];
    }

    public static function benefit_label(array $reward): string {
        $config = $reward['config'];
        switch ($reward['reward_type']) {
            case self::TYPE_PERCENT:
                return sprintf(__('%s%% de descuento en tu compra', 'euforia-puntos'), $config['percent'] ?? 0);
            case self::TYPE_FIXED:
                $currency = strtoupper($config['currency'] ?? 'ARS');
                $amount = number_format_i18n((float) ($config['amount'] ?? 0), $currency === 'USD' ? 2 : 0);
                return sprintf(__('%s %s de descuento en checkout', 'euforia-puntos'), $currency, $amount);
            case self::TYPE_MERCH:
                return $config['item_name'] ?? __('Producto Euforia', 'euforia-puntos');
            default:
                return '';
        }
    }
}
