<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="euforia-puntos-app" id="euforia-puntos-app">
    <div class="ep-header">
        <h2 class="ep-title"><?php echo esc_html($title); ?></h2>
        <p class="ep-subtitle"><?php esc_html_e('Consultá tu saldo con tu DNI y canjeá premios Euforia.', 'euforia-puntos'); ?></p>
    </div>

    <form class="ep-lookup" id="ep-lookup-form">
        <label for="ep-dni"><?php esc_html_e('DNI del pasajero', 'euforia-puntos'); ?></label>
        <div class="ep-lookup-row">
            <input type="text" id="ep-dni" name="dni" inputmode="numeric" pattern="[0-9]*"
                   placeholder="<?php esc_attr_e('Ej: 30123456', 'euforia-puntos'); ?>"
                   value="<?php echo esc_attr($prefill_dni); ?>" required>
            <button type="submit" class="ep-btn ep-btn-primary" id="ep-lookup-btn">
                <?php esc_html_e('Consultar', 'euforia-puntos'); ?>
            </button>
        </div>
    </form>

    <div class="ep-alert ep-hidden" id="ep-alert" role="alert"></div>

    <div class="ep-hidden" id="ep-dashboard">
        <div class="ep-balance-card">
            <span class="ep-balance-label"><?php esc_html_e('Puntos disponibles', 'euforia-puntos'); ?></span>
            <strong class="ep-balance-value" id="ep-balance">0</strong>
            <span class="ep-balance-dni" id="ep-balance-dni"></span>
        </div>

        <section class="ep-section">
            <h3><?php esc_html_e('Canjeá tus puntos', 'euforia-puntos'); ?></h3>
            <div class="ep-rewards" id="ep-rewards"></div>
        </section>

        <section class="ep-section">
            <h3><?php esc_html_e('Historial', 'euforia-puntos'); ?></h3>
            <ul class="ep-history" id="ep-history"></ul>
        </section>
    </div>
</div>
