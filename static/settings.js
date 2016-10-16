$(function () {
  "use strict";
  
  // JQuery UI
  $('button').button();
  $('input[type=radio], input[type=checkbox]').checkboxradio({
    icon: false
  });
  $('.vBox').sortable({
    connectWith: ".vBox"
  }).disableSelection();

  $('.vBox li').addClass('ui-state-default');

  function togglePort () {
    $('#rPortSpan').toggle($('#r-local').is(":checked"));
  }
  $('#r-local').change(togglePort);
  togglePort();

});
