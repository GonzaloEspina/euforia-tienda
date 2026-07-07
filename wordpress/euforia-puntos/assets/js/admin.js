(function ($) {
  var mediaFrame = null;

  function toggleConfigRows() {
    var type = $('#reward_type').val();
    $('.config-row').removeClass('is-visible');
    if (type === 'percent_discount') {
      $('.config-percent').addClass('is-visible');
    } else if (type === 'fixed_discount') {
      $('.config-fixed').addClass('is-visible');
    } else if (type === 'merchandising') {
      $('.config-merch').addClass('is-visible');
    }
  }

  function openMediaLibrary() {
    if (typeof wp === 'undefined' || !wp.media) {
      var msg =
        (window.euforiaPuntosAdmin && euforiaPuntosAdmin.mediaError) ||
        'No se pudo abrir la biblioteca de medios.';
      window.alert(msg);
      return;
    }

    var $preview = $('#ep-image-preview');
    var $id = $('#config_image_id');
    var $url = $('#config_image_url');
    var $remove = $('#ep-remove-image');

    if (mediaFrame) {
      mediaFrame.open();
      return;
    }

    mediaFrame = wp.media({
      title: 'Imagen del premio',
      button: { text: 'Usar esta imagen' },
      multiple: false,
      library: { type: 'image' },
    });

    mediaFrame.on('select', function () {
      var attachment = mediaFrame.state().get('selection').first().toJSON();
      var imageUrl =
        attachment.sizes && attachment.sizes.medium_large
          ? attachment.sizes.medium_large.url
          : attachment.url;

      $id.val(attachment.id);
      $url.val(imageUrl);
      $preview.html(
        '<img src="' + imageUrl + '" alt="" style="max-width:100%;height:auto;">'
      );
      $remove.show();
    });

    mediaFrame.open();
  }

  $(document).ready(function () {
    $('#reward_type').on('change', toggleConfigRows);
    toggleConfigRows();

    if (window.euforiaPuntosAdmin && euforiaPuntosAdmin.rewardsScreen) {
      $(document).on('click', '#ep-upload-image', function (e) {
        e.preventDefault();
        openMediaLibrary();
      });

      $(document).on('click', '#ep-remove-image', function (e) {
        e.preventDefault();
        $('#config_image_id').val('');
        $('#config_image_url').val('');
        $('#ep-image-preview').empty();
        $(this).hide();
      });
    }
  });
})(jQuery);
