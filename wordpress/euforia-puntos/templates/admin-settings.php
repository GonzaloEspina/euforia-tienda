<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="wrap euforia-puntos-admin">
    <h1><?php esc_html_e('Euforia Puntos — Configuración', 'euforia-puntos'); ?></h1>

    <form method="post" action="options.php">
        <?php settings_fields('euforia_puntos_settings'); ?>

        <table class="form-table" role="presentation">
            <tr>
                <th scope="row">
                    <label for="euforia_puntos_ars_per_point"><?php esc_html_e('Pesos argentinos por 1 punto', 'euforia-puntos'); ?></label>
                </th>
                <td>
                    <input type="number" step="0.01" min="0.01" class="regular-text"
                           id="euforia_puntos_ars_per_point" name="euforia_puntos_ars_per_point"
                           value="<?php echo esc_attr(get_option('euforia_puntos_ars_per_point', '1000')); ?>">
                    <p class="description">
                        <?php esc_html_e('Ejemplo: 1000 = el cliente suma 1 punto cada $1000 ARS de compra.', 'euforia-puntos'); ?>
                    </p>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="euforia_puntos_usd_per_point"><?php esc_html_e('Dólares por 1 punto', 'euforia-puntos'); ?></label>
                </th>
                <td>
                    <input type="number" step="0.01" min="0.01" class="regular-text"
                           id="euforia_puntos_usd_per_point" name="euforia_puntos_usd_per_point"
                           value="<?php echo esc_attr(get_option('euforia_puntos_usd_per_point', '1')); ?>">
                    <p class="description">
                        <?php esc_html_e('Ejemplo: 1 = 1 punto por cada USD 1 de compra.', 'euforia-puntos'); ?>
                    </p>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="euforia_puntos_order_statuses"><?php esc_html_e('Estados de pedido que acreditan puntos', 'euforia-puntos'); ?></label>
                </th>
                <td>
                    <input type="text" class="large-text" id="euforia_puntos_order_statuses"
                           name="euforia_puntos_order_statuses"
                           value="<?php echo esc_attr(get_option('euforia_puntos_order_statuses', 'completed')); ?>">
                    <p class="description"><?php esc_html_e('Separados por coma. Ej: completed,processing', 'euforia-puntos'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="euforia_puntos_dni_meta_keys"><?php esc_html_e('Campos de DNI en pedidos', 'euforia-puntos'); ?></label>
                </th>
                <td>
                    <input type="text" class="large-text" id="euforia_puntos_dni_meta_keys"
                           name="euforia_puntos_dni_meta_keys"
                           value="<?php echo esc_attr(get_option('euforia_puntos_dni_meta_keys', 'billing_wooccm11,_billing_wooccm11,billing_dni,_billing_dni,dni,DNI')); ?>">
                    <p class="description"><?php esc_html_e('Meta keys de WooCommerce donde buscar el DNI. El checkout actual usa billing_wooccm11 (WooCCM).', 'euforia-puntos'); ?></p>
                </td>
            </tr>
        </table>

        <?php submit_button(); ?>
    </form>

    <hr>
    <h2><?php esc_html_e('Página pública', 'euforia-puntos'); ?></h2>
    <p><?php esc_html_e('Creá una página en WordPress y agregá el shortcode:', 'euforia-puntos'); ?></p>
    <code>[euforia_mis_puntos]</code>
    <p><?php esc_html_e('API REST (para la PWA /tienda):', 'euforia-puntos'); ?></p>
    <ul>
        <li><code><?php echo esc_html(rest_url('euforia-puntos/v1/balance?dni=12345678')); ?></code></li>
        <li><code><?php echo esc_html(rest_url('euforia-puntos/v1/rewards')); ?></code></li>
        <li><code>POST <?php echo esc_html(rest_url('euforia-puntos/v1/redeem')); ?></code></li>
    </ul>
</div>
