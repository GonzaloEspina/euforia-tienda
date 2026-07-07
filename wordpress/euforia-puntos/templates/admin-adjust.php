<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="wrap euforia-puntos-admin">
    <h1><?php esc_html_e('Ajuste manual de puntos', 'euforia-puntos'); ?></h1>

    <?php if (!empty($message)) : ?>
        <div class="notice notice-info"><p><?php echo esc_html($message); ?></p></div>
    <?php endif; ?>

    <form method="post">
        <?php wp_nonce_field('euforia_puntos_adjust', 'euforia_puntos_adjust_nonce'); ?>
        <table class="form-table">
            <tr>
                <th><label for="dni"><?php esc_html_e('DNI', 'euforia-puntos'); ?></label></th>
                <td><input type="text" name="dni" id="dni" class="regular-text" required></td>
            </tr>
            <tr>
                <th><label for="points"><?php esc_html_e('Puntos (+ o -)', 'euforia-puntos'); ?></label></th>
                <td><input type="number" name="points" id="points" required placeholder="100 o -50"></td>
            </tr>
            <tr>
                <th><label for="note"><?php esc_html_e('Nota', 'euforia-puntos'); ?></label></th>
                <td><input type="text" name="note" id="note" class="large-text"></td>
            </tr>
        </table>
        <?php submit_button(__('Aplicar ajuste', 'euforia-puntos')); ?>
    </form>
</div>
