$(function () {
  "use strict";
 
  // ################################ 
  // UI
  $('button').button();
  $('input[type=radio], input[type=checkbox]').checkboxradio({
    icon: false
  });
  $('.vBox').sortable({
    connectWith: ".vBox",
  }).disableSelection();

  $('.vBox li').addClass('ui-state-default');

  function togglePort () {
    $('#rPortSpan, #localhostExplain').toggle($('#r-local').is(":checked"));
  }
  $('#r-local').change(togglePort);

  // ################################
  // Save / Load
  
  $('#applyButton').click(function () {
    var settings = {
      // Kanji List
      'k': $('input[name=k]:checked').attr('id').slice(2),
      // Vocab List
      'v': $('#vYesBox li').get().map(function (x) { return x.id.slice(2); }),
      // Reference List
      'r': $('#r-local').prop('checked') ? +$('#r-port').val() : 0
    };
    console.log(settings);
    var message = saveSettings(settings);
    if (message === true) {
      $('#message').text('Saved.');
      window.location = 'index.html';
    } else {
      $('#message').text(message);
    }
  });

  $('#cancelButton').click(function () {
    window.location = 'index.html';
  });

  // ################################
  // Ready!
  (function () {
    var settings = loadSettings();
    console.log(settings);
    // Kanji List
    var kRadio = $('#k-' + settings.k);
    if (!kRadio.length) {
      kRadio = $('#k-grade');
    }
    kRadio.prop('checked', true);
    kRadio.button("refresh");
    // Vocab List
    settings.v.forEach(function (name) {
      var vLi = $('#v-' + name);
      if (vLi.length) {
        vLi.appendTo('#vYesBox');
      }
    });
    // Reference List
    if (settings.r) {
      $('#r-local').prop('checked', true);
      $('#r-local').button('refresh');
      $('#r-port').val(+settings.r);
    } else {
      $('#r-local').prop('checked', false);
    }
    togglePort();
    $('[type=radio], input[type=checkbox]').button('refresh');
  })();

});
