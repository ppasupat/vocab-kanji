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


  // ################################
  // Save / Load
  
  $('#applyButton').click(function () {
    let settings = {
      // Kanji List
      'k': $('input[name=k]:checked').attr('id').slice(2),
      // Vocab List
      'v': $('#vYesBox li').get().map(function (x) { return x.id.slice(2); }),
    };
    console.log(settings);
    let message = saveSettings(settings);
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
    let settings = loadSettings();
    console.log(settings);
    // Kanji List
    let kRadio = $('#k-' + settings.k);
    if (!kRadio.length) {
      kRadio = $('#k-grade');
    }
    kRadio.prop('checked', true);
    kRadio.button("refresh");
    // Vocab List
    settings.v.forEach(function (name) {
      let vLi = $('#v-' + name);
      if (vLi.length) {
        vLi.appendTo('#vYesBox');
      }
    });
    $('[type=radio], input[type=checkbox]').button('refresh');
  })();

});
