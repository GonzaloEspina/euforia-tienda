<?php
if (!defined('ABSPATH')) {
    exit;
}

$tab = isset($_GET['tab']) ? sanitize_key(wp_unslash($_GET['tab'])) : 'history';
$allowed_tabs = ['history', 'passenger', 'adjust'];
if (!in_array($tab, $allowed_tabs, true)) {
    $tab = 'history';
}

$base_url = admin_url('admin.php?page=euforia-puntos-manage');

function euforia_puntos_type_label(string $type): string {
    $labels = [
        'earn' => __('Compra', 'euforia-puntos'),
        'redeem' => __('Canje', 'euforia-puntos'),
        'adjust' => __('Ajuste', 'euforia-puntos'),
    ];
    return $labels[$type] ?? $type;
}
?>
<div class="wrap euforia-puntos-admin">
    <h1><?php esc_html_e('Gestión de puntos', 'euforia-puntos'); ?></h1>

    <nav class="nav-tab-wrapper ep-tabs">
        <a href="<?php echo esc_url($base_url . '&tab=history'); ?>"
           class="nav-tab <?php echo $tab === 'history' ? 'nav-tab-active' : ''; ?>">
            <?php esc_html_e('Historial de movimientos', 'euforia-puntos'); ?>
        </a>
        <a href="<?php echo esc_url($base_url . '&tab=passenger'); ?>"
           class="nav-tab <?php echo $tab === 'passenger' ? 'nav-tab-active' : ''; ?>">
            <?php esc_html_e('Buscar pasajero', 'euforia-puntos'); ?>
        </a>
        <a href="<?php echo esc_url($base_url . '&tab=adjust'); ?>"
           class="nav-tab <?php echo $tab === 'adjust' ? 'nav-tab-active' : ''; ?>">
            <?php esc_html_e('Agregar / quitar puntos', 'euforia-puntos'); ?>
        </a>
    </nav>

    <?php if (!empty($message)) : ?>
        <div class="notice notice-<?php echo !empty($message_type) && $message_type === 'error' ? 'error' : 'success'; ?> is-dismissible">
            <p><?php echo esc_html($message); ?></p>
        </div>
    <?php endif; ?>

    <?php if ($tab === 'history') : ?>
        <?php
        $filter_type = isset($_GET['filter_type']) ? sanitize_key(wp_unslash($_GET['filter_type'])) : '';
        $filter_dni = isset($_GET['filter_dni']) ? sanitize_text_field(wp_unslash($_GET['filter_dni'])) : '';
        $filter_search = isset($_GET['filter_search']) ? sanitize_text_field(wp_unslash($_GET['filter_search'])) : '';
        $page = max(1, (int) ($_GET['paged'] ?? 1));
        $per_page = 25;

        $query_args = [
            'page' => $page,
            'per_page' => $per_page,
        ];
        if ($filter_type !== '') {
            $query_args['type'] = $filter_type;
        }
        if ($filter_dni !== '') {
            $query_args['dni'] = $filter_dni;
        }
        if ($filter_search !== '') {
            $query_args['search'] = $filter_search;
        }

        $entries = Euforia_Puntos_Database::query_ledger($query_args);
        $total = Euforia_Puntos_Database::count_ledger($query_args);
        $total_pages = max(1, (int) ceil($total / $per_page));
        ?>

        <div class="euforia-puntos-panel ep-tab-panel">
            <form method="get" class="ep-filters">
                <input type="hidden" name="page" value="euforia-puntos-manage">
                <input type="hidden" name="tab" value="history">

                <label>
                    <?php esc_html_e('Tipo', 'euforia-puntos'); ?>
                    <select name="filter_type">
                        <option value=""><?php esc_html_e('Todos', 'euforia-puntos'); ?></option>
                        <option value="earn" <?php selected($filter_type, 'earn'); ?>><?php esc_html_e('Compras (+)', 'euforia-puntos'); ?></option>
                        <option value="redeem" <?php selected($filter_type, 'redeem'); ?>><?php esc_html_e('Canjes (-)', 'euforia-puntos'); ?></option>
                        <option value="adjust" <?php selected($filter_type, 'adjust'); ?>><?php esc_html_e('Ajustes', 'euforia-puntos'); ?></option>
                    </select>
                </label>

                <label>
                    <?php esc_html_e('DNI', 'euforia-puntos'); ?>
                    <input type="text" name="filter_dni" value="<?php echo esc_attr($filter_dni); ?>" placeholder="12345678">
                </label>

                <label>
                    <?php esc_html_e('Buscar', 'euforia-puntos'); ?>
                    <input type="search" name="filter_search" value="<?php echo esc_attr($filter_search); ?>" placeholder="<?php esc_attr_e('DNI o nota', 'euforia-puntos'); ?>">
                </label>

                <?php submit_button(__('Filtrar', 'euforia-puntos'), 'secondary', '', false); ?>
                <a class="button" href="<?php echo esc_url($base_url . '&tab=history'); ?>"><?php esc_html_e('Limpiar', 'euforia-puntos'); ?></a>
            </form>

            <p class="ep-summary">
                <?php
                printf(
                    esc_html__('Mostrando %1$d movimientos (total: %2$d)', 'euforia-puntos'),
                    count($entries),
                    $total
                );
                ?>
            </p>

            <table class="widefat striped ep-data-table">
                <thead>
                    <tr>
                        <th><?php esc_html_e('Fecha', 'euforia-puntos'); ?></th>
                        <th><?php esc_html_e('DNI', 'euforia-puntos'); ?></th>
                        <th><?php esc_html_e('Tipo', 'euforia-puntos'); ?></th>
                        <th><?php esc_html_e('Puntos', 'euforia-puntos'); ?></th>
                        <th><?php esc_html_e('Saldo después', 'euforia-puntos'); ?></th>
                        <th><?php esc_html_e('Detalle', 'euforia-puntos'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($entries)) : ?>
                        <tr><td colspan="6"><?php esc_html_e('No hay movimientos con esos filtros.', 'euforia-puntos'); ?></td></tr>
                    <?php else : ?>
                        <?php foreach ($entries as $entry) : ?>
                            <tr>
                                <td><?php echo esc_html($entry['created_at']); ?></td>
                                <td>
                                    <a href="<?php echo esc_url($base_url . '&tab=passenger&dni=' . rawurlencode($entry['dni'])); ?>">
                                        <?php echo esc_html($entry['dni']); ?>
                                    </a>
                                </td>
                                <td>
                                    <span class="ep-badge ep-badge-<?php echo esc_attr($entry['type']); ?>">
                                        <?php echo esc_html(euforia_puntos_type_label($entry['type'])); ?>
                                    </span>
                                </td>
                                <td class="<?php echo (int) $entry['points'] >= 0 ? 'ep-positive' : 'ep-negative'; ?>">
                                    <?php echo (int) $entry['points'] > 0 ? '+' : ''; ?><?php echo esc_html((string) $entry['points']); ?>
                                </td>
                                <td><?php echo esc_html((string) $entry['balance_after']); ?></td>
                                <td>
                                    <?php echo esc_html($entry['note'] ?: '—'); ?>
                                    <?php if (!empty($entry['order_id'])) : ?>
                                        <br><small><?php printf(esc_html__('Pedido #%d', 'euforia-puntos'), (int) $entry['order_id']); ?></small>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>

            <?php if ($total_pages > 1) : ?>
                <div class="tablenav">
                    <div class="tablenav-pages">
                        <?php
                        echo wp_kses_post(
                            paginate_links([
                                'base' => add_query_arg(['paged' => '%#%', 'tab' => 'history'], $base_url),
                                'format' => '',
                                'current' => $page,
                                'total' => $total_pages,
                                'prev_text' => '&laquo;',
                                'next_text' => '&raquo;',
                            ])
                        );
                        ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>

    <?php elseif ($tab === 'passenger') : ?>
        <?php
        $search_dni = isset($_GET['dni']) ? sanitize_text_field(wp_unslash($_GET['dni'])) : '';
        $normalized = $search_dni !== '' ? Euforia_Puntos_DNI::normalize($search_dni) : null;
        $profile = $normalized ? Euforia_Puntos_Database::get_passenger_profile($normalized) : null;
        $ledger = $normalized ? Euforia_Puntos_Database::get_ledger($normalized, 50) : [];
        $redemptions = $normalized ? Euforia_Puntos_Database::get_redemptions($normalized, 50) : [];
        ?>

        <div class="euforia-puntos-panel ep-tab-panel">
            <form method="get" class="ep-filters">
                <input type="hidden" name="page" value="euforia-puntos-manage">
                <input type="hidden" name="tab" value="passenger">
                <label>
                    <?php esc_html_e('DNI del pasajero', 'euforia-puntos'); ?>
                    <input type="text" name="dni" value="<?php echo esc_attr($search_dni); ?>" required placeholder="12345678">
                </label>
                <?php submit_button(__('Buscar', 'euforia-puntos'), 'primary', '', false); ?>
            </form>

            <?php if ($normalized && !$profile) : ?>
                <p><?php esc_html_e('No hay cuenta de puntos para este DNI. Podés crearla desde la pestaña de ajustes.', 'euforia-puntos'); ?></p>
            <?php elseif ($profile) : ?>
                <div class="ep-passenger-card">
                    <h2><?php esc_html_e('Pasajero', 'euforia-puntos'); ?> · DNI <?php echo esc_html($profile['dni']); ?></h2>
                    <p class="ep-passenger-balance">
                        <strong><?php echo esc_html((string) $profile['balance']); ?></strong>
                        <?php esc_html_e('puntos disponibles', 'euforia-puntos'); ?>
                    </p>
                    <?php if ($profile['name'] || $profile['email']) : ?>
                        <p>
                            <?php echo esc_html(trim(($profile['name'] ?? '') . ' · ' . ($profile['email'] ?? ''), ' ·')); ?>
                        </p>
                    <?php endif; ?>
                    <p>
                        <a class="button button-secondary" href="<?php echo esc_url($base_url . '&tab=adjust&dni=' . rawurlencode($profile['dni'])); ?>">
                            <?php esc_html_e('Ajustar puntos', 'euforia-puntos'); ?>
                        </a>
                    </p>
                </div>

                <h3><?php esc_html_e('Historial de movimientos', 'euforia-puntos'); ?></h3>
                <table class="widefat striped ep-data-table">
                    <thead>
                        <tr>
                            <th><?php esc_html_e('Fecha', 'euforia-puntos'); ?></th>
                            <th><?php esc_html_e('Tipo', 'euforia-puntos'); ?></th>
                            <th><?php esc_html_e('Puntos', 'euforia-puntos'); ?></th>
                            <th><?php esc_html_e('Saldo', 'euforia-puntos'); ?></th>
                            <th><?php esc_html_e('Detalle', 'euforia-puntos'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($ledger)) : ?>
                            <tr><td colspan="5"><?php esc_html_e('Sin movimientos.', 'euforia-puntos'); ?></td></tr>
                        <?php else : ?>
                            <?php foreach ($ledger as $entry) : ?>
                                <tr>
                                    <td><?php echo esc_html($entry['created_at']); ?></td>
                                    <td><?php echo esc_html(euforia_puntos_type_label($entry['type'])); ?></td>
                                    <td class="<?php echo (int) $entry['points'] >= 0 ? 'ep-positive' : 'ep-negative'; ?>">
                                        <?php echo (int) $entry['points'] > 0 ? '+' : ''; ?><?php echo esc_html((string) $entry['points']); ?>
                                    </td>
                                    <td><?php echo esc_html((string) $entry['balance_after']); ?></td>
                                    <td><?php echo esc_html($entry['note'] ?: '—'); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>

                <h3><?php esc_html_e('Canjes realizados', 'euforia-puntos'); ?></h3>
                <table class="widefat striped ep-data-table">
                    <thead>
                        <tr>
                            <th><?php esc_html_e('Fecha', 'euforia-puntos'); ?></th>
                            <th><?php esc_html_e('Premio', 'euforia-puntos'); ?></th>
                            <th><?php esc_html_e('Puntos', 'euforia-puntos'); ?></th>
                            <th><?php esc_html_e('Estado', 'euforia-puntos'); ?></th>
                            <th><?php esc_html_e('Cupón', 'euforia-puntos'); ?></th>
                            <th><?php esc_html_e('Vence', 'euforia-puntos'); ?></th>
                            <th><?php esc_html_e('Acciones', 'euforia-puntos'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($redemptions)) : ?>
                            <tr><td colspan="7"><?php esc_html_e('Sin canjes.', 'euforia-puntos'); ?></td></tr>
                        <?php else : ?>
                            <?php foreach ($redemptions as $row) :
                                $summary = Euforia_Puntos_Redemptions::public_summary($row);
                                ?>
                                <tr>
                                    <td><?php echo esc_html($summary['created_at']); ?></td>
                                    <td><?php echo esc_html($summary['reward_title'] ?: ('#' . $summary['reward_id'])); ?></td>
                                    <td class="ep-negative">-<?php echo esc_html((string) $summary['points_spent']); ?></td>
                                    <td><?php echo esc_html($summary['status_label']); ?></td>
                                    <td><?php echo esc_html($summary['coupon_code'] ?: '—'); ?></td>
                                    <td><?php echo esc_html($summary['expires_at'] ?: '—'); ?></td>
                                    <td>
                                        <?php if ($summary['status'] === Euforia_Puntos_Redemptions::STATUS_PENDING) : ?>
                                            <a class="button button-small"
                                               href="<?php echo esc_url(wp_nonce_url(
                                                   admin_url('admin.php?page=euforia-puntos-manage&tab=passenger&dni=' . rawurlencode($profile['dni'] ?? $search_dni) . '&action=fulfill_redemption&redemption_id=' . $summary['id']),
                                                   'euforia_fulfill_redemption'
                                               )); ?>">
                                                <?php esc_html_e('Marcar como canjeado', 'euforia-puntos'); ?>
                                            </a>
                                        <?php else : ?>
                                            —
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>

    <?php else : ?>
        <?php
        $prefill_dni = isset($_GET['dni']) ? sanitize_text_field(wp_unslash($_GET['dni'])) : '';
        $current_balance = null;
        if ($prefill_dni !== '') {
            $norm = Euforia_Puntos_DNI::normalize($prefill_dni);
            if ($norm) {
                $current_balance = Euforia_Puntos_Database::get_balance($norm);
            }
        }
        ?>

        <div class="euforia-puntos-panel ep-tab-panel">
            <p><?php esc_html_e('Sumá o restá puntos manualmente. Los ajustes quedan registrados en el historial.', 'euforia-puntos'); ?></p>

            <form method="post" class="ep-adjust-form">
                <?php wp_nonce_field('euforia_puntos_adjust', 'euforia_puntos_adjust_nonce'); ?>
                <table class="form-table">
                    <tr>
                        <th><label for="dni"><?php esc_html_e('DNI', 'euforia-puntos'); ?></label></th>
                        <td>
                            <input type="text" name="dni" id="dni" class="regular-text" required value="<?php echo esc_attr($prefill_dni); ?>">
                            <?php if ($current_balance !== null) : ?>
                                <p class="description"><?php printf(esc_html__('Saldo actual: %d puntos', 'euforia-puntos'), $current_balance); ?></p>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="points"><?php esc_html_e('Puntos', 'euforia-puntos'); ?></label></th>
                        <td>
                            <input type="number" name="points" id="points" required placeholder="100 o -50">
                            <p class="description"><?php esc_html_e('Usá números positivos para sumar y negativos para restar.', 'euforia-puntos'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="note"><?php esc_html_e('Motivo / nota', 'euforia-puntos'); ?></label></th>
                        <td><input type="text" name="note" id="note" class="large-text" placeholder="<?php esc_attr_e('Ej: compensación por demora', 'euforia-puntos'); ?>"></td>
                    </tr>
                </table>
                <?php submit_button(__('Aplicar ajuste', 'euforia-puntos')); ?>
            </form>
        </div>
    <?php endif; ?>
</div>
