$(function () {
  'use strict';
  var settings = loadSettings();
  console.log(settings);

  var kanjiFile = 'data/kanji/' + settings.k + '.json',
      parts_not_loaded = 1 + settings.v.length;

  // Load data
  function increment_loaded() {
    parts_not_loaded--;
    if (parts_not_loaded === 0) {
      // Specify ?q=___ to query the character
      var character = gup('q');
      if (character) {
        $('#txtChar').val(character);
        $('#formChar').submit();
      }
    }
  };

  // ################################
  // Kanji

  var kanjis = {};
  $.get(kanjiFile, function (data) {
    data.forEach(function (book) {
      var bookCharElt = $('<div class=book-char>')
            .appendTo('#bookChar').hide();
      var bookListElt = $('<div>')
            .addClass('book-list pink-button unselectable')
            .text(book.shortname).attr('title', book.name)
            .appendTo('#bookList')
            .click(function () {
              $('.book-list').removeClass('active');
              $('.book-char').hide();
              bookListElt.addClass('active');
              bookCharElt.show();
            });
      book.chapters.forEach(function (chapter) {
        var chapterElt = $('<p>').appendTo(bookCharElt)
          .append($('<span class=title>').text(chapter.name));
        chapter.kanji.split('').forEach(function (chr) {
          if (chr === '|') {
            chapterElt.append(' | ');
          } else if (chr === '(' || chr === ')') {
            chapterElt.append(chr);
          } else if (chr !== ' ') {
            var charSpan = $('<span class=chr>').text(chr);
            chapterElt.append(' ').append(charSpan);
            if (kanjis[chr] !== undefined) {
              console.log('Warning! Repeated character: ' + chr);
            }
            kanjis[chr] = [bookListElt, charSpan];
          }
        });
      });
    });
    increment_loaded();
  });

  // ################################
  // Vocab
  // Each item is {name: ___, words: ___}

  var vocab_groups = [];
  settings.v.forEach(function (name, i) {
    var group = {'name': name};
    vocab_groups.push(group);
    $.get('data/vocab/' + name + '.txt', function (data) {
      group.words = data.split('\n');
      group.title = group.words[0].slice(2);
      group.words[0] = '';
      increment_loaded();
    });
  });

  // ################################
  // Kanji selection

  $('#bookChar').on('click', '.chr', function () {
    $('#txtChar').val($(this).text());
    $('#formChar').submit();
  });

  var BLANK = '\u3000';
  var wwwjdicUrl = '//www.edrdg.org/cgi-bin/wwwjdic/wwwjdic?1MUJ';
  function getAnchor(text) {
    return $('<a>').text(text)
      .attr('href', wwwjdicUrl + text)
      .attr('target', 'extFrame');
  }

  function query() {
    var c = firstChar($('#txtChar').val());
    // Clear the display
    $('#wordList, #jlptList').empty();
    if (!c || c === ' ') {
      $('#theChar').text(BLANK);
      $('#charDesc').hide();
      return;
    }
    $('#theChar').text(c);
    // Find vocab
    var pattern = new RegExp(c);
    vocab_groups.forEach(function (group, i) {
      var result = $.grep(group.words, function (word) {
        return pattern.test(word);
      });
      if (result.length) {
        $('#wordList').append($('<h3>').text(group.title));
        result.forEach(function (word) {
          $('#wordList').append(getAnchor(word).addClass('w' + (i % 7)));
        });
        $('#wordList').append($('<div class=clear>'));
      }
    });
    $('#charDesc').show();
    // Change highlight 
    var toHighlight = kanjis[c];
    $('.chr').removeClass('highlight');
    if (toHighlight) {
      toHighlight[0].click();
      toHighlight[1].addClass('highlight');
    } else {
      $('.book-list').removeClass('active');
      $('.book-char').hide();
    }
    // Open reference
    goToSite();
  };
  
  $('#formChar').submit(function (event) {
    query();
    return false;
  });
  $('#txtChar').change(function (event) {
    $('#formChar').submit();
  });

  // Resize txtChar
  $('#txtChar').focus(function (event) {
    $('#txtChar').width('7em');
    $('#selSearch').hide();
  });
  $('#txtChar').blur(function (event) {
    $('#txtChar').width('1.5em');
    $('#selSearch').show();
  });

  // ################################
  // Reference

  // Search functions
  var websites = {
    btnWWWJDIC: '//www.edrdg.org/cgi-bin/wwwjdic/wwwjdic?1MMJ',
    btnJisho: '//jisho.org/search/%23kanji%20',
    btnWikiE: '//en.wiktionary.org/wiki/',
  };

  var goToSite = function () {
    if ($('#theChar').text() === BLANK) return;
    var sitename = $('#selSearch').val();
    var target = '';
    if (sitename !== 'btnX') {
      target = websites[sitename] + $('#theChar').text();
    }
    $('#extFrame').attr('src', target);
  };
  $('#selSearch').change(goToSite);

  // ################################
  // Other stuff

  // Layout functions
  var resizer = function () {
    var sel_height = ($(window).height() - 20
                      - $('#charSelUpper').outerHeight(true));
    $('#charSelLower').height(sel_height);
    var desc_height = ($(window).height() - 20
                       - $('#charDispInner').outerHeight(true));
    $('#charDesc').height(desc_height);
  };
  $(window).resize(resizer);
  resizer();

  // Reset fields
  $('#txtChar').val('');
  $('#selSearch').val('btnX');
  $('#charDesc').hide();
  $('#extFrame').attr('src', '');

});
