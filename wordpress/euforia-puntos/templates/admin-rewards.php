<?php
if (!defined('ABSPATH')) {
    exit;
}

$rewards = Euforia_Puntos_Rewards::list_all(false);
$edit_id = isset($_GET['edit']) ? (int) $_GET['edit'] : 0;
$editing = $edit_id ? Euforia_Puntos_Rewards::get($edit_id) : null;
$types = Euforia_Puntos_Rewards::types();
?>
<div class="wrap euforia-puntos-admin">
    <h1><?php esc_html_e('Premios y canjes', 'euforia-puntos'); ?></h1>

    <?php if (!empty($_GET['saved'])) : ?>
        <div class="notice notice-success is-dismissible"><p><?php esc_html_e('Premio guardado.', 'euforia-puntos'); ?></p></div>
    <?php endif; ?>

    <div class="euforia-puntos-grid">
        <div class="euforia-puntos-panel">
            <h2><?php echo $editing ? esc_html__('Editar premio', 'euforia-puntos') : esc_html__('Nuevo premio', 'euforia-puntos'); ?></h2>
            <form method="post">
                <?php wp_nonce_field('euforia_puntos_save_reward', 'euforia_puntos_reward_nonce'); ?>
                <?php if ($editing) : ?>
                    <input type="hidden" name="reward_id" value="<?php echo esc_attr($editing['id']); ?>">
                <?php endif; ?>

                <table class="form-table">
                    <tr>
                        <th><label for="title"><?php esc_html_e('Título', 'euforia-puntos'); ?></label></th>
                        <td><input type="text" class="regular-text" name="title" id="title" required
                                   value="<?php echo esc_attr($editing['title'] ?? ''); ?>"></td>
                    </tr>
                    <tr>
                        <th><label for="description"><?php esc_html_e('Descripción', 'euforia-puntos'); ?></label></th>
                        <td><textarea name="description" id="description" class="large-text" rows="3"><?php echo esc_textarea($editing['description'] ?? ''); ?></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="reward_type"><?php esc_html_e('Tipo', 'euforia-puntos'); ?></label></th>
                        <td>
                            <select name="reward_type" id="reward_type" class="regular-text">
                                <?php foreach ($types as $key => $label) : ?>
                                    <option value="<?php echo esc_attr($key); ?>" <?php selected($editing['reward_type'] ?? '', $key); ?>>
                                        <?php echo esc_html($label); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </td>
                    </tr>
                    <tr class="config-row config-percent">
                        <th><label for="config_percent"><?php esc_html_e('Porcentaje de descuento', 'euforia-puntos'); ?></label></th>
                        <td><input type="number" min="1" max="100" step="1" name="config_percent" id="config_percent"
                                   value="<?php echo esc_attr($editing['config']['percent'] ?? 10); ?>"> %</td>
                    </tr>
                    <tr class="config-row config-fixed">
                        <th><label for="config_amount"><?php esc_html_e('Monto fijo', 'euforia-puntos'); ?></label></th>
                        <td>
                            <input type="number" min="0.01" step="0.01" name="config_amount" id="config_amount"
                                   value="<?php echo esc_attr($editing['config']['amount'] ?? 5000); ?>">
                            <select name="config_currency" id="config_currency">
                                <option value="ARS" <?php selected($editing['config']['currency'] ?? 'ARS', 'ARS'); ?>>ARS</option>
                                <option value="USD" <?php selected($editing['config']['currency'] ?? 'ARS', 'USD'); ?>>USD</option>
                            </select>
                        </td>
                    </tr>
                    <tr class="config-row config-merch">
                        <th><label for="config_item_name"><?php esc_html_e('Producto merchandising', 'euforia-puntos'); ?></label></th>
                        <td><input type="text" class="regular-text" name="config_item_name" id="config_item_name"
                                   value="<?php echo esc_attr($editing['config']['item_name'] ?? ''); ?>"
                                   placeholder="<?php esc_attr_e('Ej: Remera Euforia talle M', 'euforia-puntos'); ?>"></td>
                    </tr>
                    <tr class="config-row config-merch">
                        <th><?php esc_html_e('Imagen del premio', 'euforia-puntos'); ?></th>
                        <td>
                            <div class="ep-image-upload">
                                <input type="hidden" name="config_image_id" id="config_image_id"
                                       value="<?php echo esc_attr($editing['config']['image_id'] ?? ''); ?>">
                                <input type="hidden" name="config_image_url" id="config_image_url"
                                       value="<?php echo esc_attr($editing['config']['image_url'] ?? ''); ?>">
                                <div class="ep-image-preview" id="ep-image-preview">
                                    <?php if (!empty($editing['config']['image_url'])) : ?>
                                        <img src="<?php echo esc_url($editing['config']['image_url']); ?>" alt="">
                                    <?php endif; ?>
                                </div>
                                <p>
                                    <button type="button" class="button" id="ep-upload-image">
                                        <?php esc_html_e('Subir imagen', 'euforia-puntos'); ?>
                                    </button>
                                    <button type="button" class="button" id="ep-remove-image" style="<?php echo empty($editing['config']['image_url']) ? 'display:none' : ''; ?>">
                                        <?php esc_html_e('Quitar', 'euforia-puntos'); ?>
                                    </button>
                                </p>
                                <p class="description"><?php esc_html_e('Se muestra en la tarjeta de canje del usuario. Recomendado 800×600 px o similar.', 'euforia-puntos'); ?></p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="points_cost"><?php esc_html_e('Costo en puntos', 'euforia-puntos'); ?></label></th>
                        <td><input type="number" min="1" name="points_cost" id="points_cost" required
                                   value="<?php echo esc_attr($editing['points_cost'] ?? 100); ?>"></td>
                    </tr>
                    <tr>
                        <th><label for="expiration_mode"><?php esc_html_e('Vencimiento del canje', 'euforia-puntos'); ?></label></th>
                        <td>
                            <?php
                            $expiration = $editing['config']['expiration'] ?? [];
                            $exp_mode = $expiration['mode'] ?? 'none';
                            ?>
                            <select name="expiration_mode" id="expiration_mode" class="regular-text">
                                <option value="none" <?php selected($exp_mode, 'none'); ?>><?php esc_html_e('Sin vencimiento', 'euforia-puntos'); ?></option>
                                <option value="fixed_date" <?php selected($exp_mode, 'fixed_date'); ?>><?php esc_html_e('Fecha fija', 'euforia-puntos'); ?></option>
                                <option value="relative" <?php selected($exp_mode, 'relative'); ?>><?php esc_html_e('Plazo desde el canje', 'euforia-puntos'); ?></option>
                            </select>
                            <p class="description"><?php esc_html_e('Si vence y no se usó, el canje pasa a estado vencido.', 'euforia-puntos'); ?></p>
                        </td>
                    </tr>
                    <tr class="config-row config-expiration-fixed">
                        <th><label for="expiration_fixed_date"><?php esc_html_e('Válido hasta', 'euforia-puntos'); ?></label></th>
                        <td>
                            <input type="date" name="expiration_fixed_date" id="expiration_fixed_date"
                                   value="<?php echo esc_attr($expiration['fixed_date'] ?? ''); ?>">
                        </td>
                    </tr>
                    <tr class="config-row config-expiration-relative">
                        <th><label for="expiration_relative_value"><?php esc_html_e('Plazo desde el canje', 'euforia-puntos'); ?></label></th>
                        <td>
                            <input type="number" min="1" name="expiration_relative_value" id="expiration_relative_value"
                                   value="<?php echo esc_attr($expiration['relative_value'] ?? 30); ?>">
                            <select name="expiration_relative_unit" id="expiration_relative_unit">
                                <option value="days" <?php selected($expiration['relative_unit'] ?? 'days', 'days'); ?>><?php esc_html_e('Días', 'euforia-puntos'); ?></option>
                                <option value="months" <?php selected($expiration['relative_unit'] ?? 'days', 'months'); ?>><?php esc_html_e('Meses', 'euforia-puntos'); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="sort_order"><?php esc_html_e('Orden', 'euforia-puntos'); ?></label></th>
                        <td><input type="number" name="sort_order" id="sort_order"
                                   value="<?php echo esc_attr($editing['sort_order'] ?? 0); ?>"></td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e('Habilitado', 'euforia-puntos'); ?></th>
                        <td><label><input type="checkbox" name="enabled" value="1" <?php checked($editing ? $editing['enabled'] : true); ?>>
                            <?php esc_html_e('Visible para canje', 'euforia-puntos'); ?></label></td>
                    </tr>
                </table>
                <?php submit_button($editing ? __('Actualizar premio', 'euforia-puntos') : __('Crear premio', 'euforia-puntos')); ?>
                <?php if ($editing) : ?>
                    <a class="button" href="<?php echo esc_url(admin_url('admin.php?page=euforia-puntos-rewards')); ?>"><?php esc_html_e('Cancelar', 'euforia-puntos'); ?></a>
                <?php endif; ?>
            </form>
        </div>

        <div class="euforia-puntos-panel">
            <h2><?php esc_html_e('Premios configurados', 'euforia-puntos'); ?></h2>
            <table class="widefat striped">
                <thead>
                    <tr>
                        <th style="width:70px"><?php esc_html_e('Vista', 'euforia-puntos'); ?></th>
                        <th><?php esc_html_e('Título', 'euforia-puntos'); ?></th>
                        <th><?php esc_html_e('Tipo', 'euforia-puntos'); ?></th>
                        <th><?php esc_html_e('Puntos', 'euforia-puntos'); ?></th>
                        <th><?php esc_html_e('Estado', 'euforia-puntos'); ?></th>
                        <th><?php esc_html_e('Acciones', 'euforia-puntos'); ?></th>
                    </tr>
                </thead>
                <tbody>
                <?php if (empty($rewards)) : ?>
                    <tr><td colspan="6"><?php esc_html_e('No hay premios todavía.', 'euforia-puntos'); ?></td></tr>
                <?php else : ?>
                    <?php foreach ($rewards as $reward) :
                        $visual = Euforia_Puntos_Rewards::get_visual($reward);
                        ?>
                        <tr>
                            <td>
                                <?php if ($visual['visual_type'] === 'image' && $visual['image_url']) : ?>
                                    <img class="ep-list-thumb" src="<?php echo esc_url($visual['image_url']); ?>" alt="">
                                <?php else : ?>
                                    <div class="ep-list-icon is-<?php echo esc_attr($visual['icon']); ?>">
                                        <?php echo esc_html($visual['badge_text'] ?: '★'); ?>
                                    </div>
                                <?php endif; ?>
                            </td>
                            <td><strong><?php echo esc_html($reward['title']); ?></strong><br><small><?php echo esc_html(Euforia_Puntos_Rewards::benefit_label($reward)); ?></small></td>
                            <td><?php echo esc_html($reward['type_label']); ?></td>
                            <td><?php echo esc_html((string) $reward['points_cost']); ?></td>
                            <td><?php echo $reward['enabled'] ? '<span class="ep-status on">' . esc_html__('Activo', 'euforia-puntos') . '</span>' : '<span class="ep-status off">' . esc_html__('Inactivo', 'euforia-puntos') . '</span>'; ?></td>
                            <td>
                                <a href="<?php echo esc_url(admin_url('admin.php?page=euforia-puntos-rewards&edit=' . $reward['id'])); ?>"><?php esc_html_e('Editar', 'euforia-puntos'); ?></a>
                                |
                                <?php if ($reward['enabled']) : ?>
                                    <a href="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=euforia-puntos-rewards&action=toggle_off&reward_id=' . $reward['id']), 'euforia_puntos_reward_' . $reward['id'])); ?>"><?php esc_html_e('Desactivar', 'euforia-puntos'); ?></a>
                                <?php else : ?>
                                    <a href="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=euforia-puntos-rewards&action=toggle_on&reward_id=' . $reward['id']), 'euforia_puntos_reward_' . $reward['id'])); ?>"><?php esc_html_e('Activar', 'euforia-puntos'); ?></a>
                                <?php endif; ?>
                                |
                                <a class="ep-delete" href="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=euforia-puntos-rewards&action=delete&reward_id=' . $reward['id']), 'euforia_puntos_reward_' . $reward['id'])); ?>" onclick="return confirm('<?php esc_attr_e('¿Eliminar este premio?', 'euforia-puntos'); ?>');"><?php esc_html_e('Eliminar', 'euforia-puntos'); ?></a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
