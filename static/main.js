$(function () {
  'use strict';
  var settings = loadSettings();
  console.log(settings);

  var kanjiFile = 'data/kanji/' + settings.k + '.json',
      kago_json = 'data/reference/kago.json',
      xiuwenyuan_json = 'data/reference/xiuwenyuan.json',
      parts_not_loaded = 3 + settings.v.length;

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
  var wwwjdicUrl = 'https://www.edrdg.org/cgi-bin/wwwjdic/wwwjdic?1MUJ';
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
    btnWWWJDIC: 'https://www.edrdg.org/cgi-bin/wwwjdic/wwwjdic?1MMJ',
    btnYamasa: 'https://www.yamasa.cc/ocjs/kanjidic.nsf/SortedByKanji2THEnglish/',
    btnKDamage: 'https://kanjidamage.com/kanji/search?q=',
    btnWikiE: 'https://en.wiktionary.org/wiki/',
    btnWikiJ: 'https://ja.wiktionary.org/wiki/',
    btnKotobank: 'https://kotobank.jp/word/',
    btnCEty: 'https://www.chineseetymology.org/CharacterEtymology.aspx?characterInput=',
    btnCChr: 'https://chinese-characters.org/cgi-bin/lookup.cgi?characterInput=',
    btnChise: 'https://www.chise.org/chisewiki/view.cgi?character=',
    btnNico: 'https://dic.nicovideo.jp/a/',
    btnKago: 'https://www5b.biglobe.ne.jp/~shu-sato/kanji/kago.htm',
    btnKNet: 'https://www.kanjinetworks.com/eng/kanji-dictionary/online-kanji-etymology-dictionary.cfm?kanji_id=',
    btnZDic: 'https://www.zdic.net/sousuo?q=',
    btnGGArt: 'https://www.iguci.cn/dictionary/dcontent.php?word=',
    btnXiu: 'https://www.xiuwenyuan.com/ziyuan/',
    btnLocalhost: 'https://localhost:' + settings.r + '/?q=',
  };

  var kagoMap = {}, xiuwenyuanMap;
  $.getJSON(kago_json, function (data) {
    data.forEach(function (item) {
      for (var i = 0; i < item[1].length; i++) {
        kagoMap[item[1][i]] = item[0];
      }
    });
    increment_loaded();
  });
  $.getJSON(xiuwenyuan_json, function (data) {
    xiuwenyuanMap = data;
    increment_loaded();
  });
  if (!settings.r) {
    $('.localhost').hide();
  }

  var goToSite = function () {
    if ($('#theChar').text() === BLANK) return;
    var sitename = $('#selSearch').val();
    var target = '';
    if (sitename === 'btnKago') {
      target = websites[sitename];
      var anchor = kagoMap[$('#theChar').text()];
      if (anchor !== undefined) {
        target += ('#' + anchor);
      }
    } else if (sitename === 'btnXiu') {
      target = websites[sitename];
      var page = xiuwenyuanMap[$('#theChar').text()];
      if (page !== undefined) {
        target += (page + '.html');
      }
    } else if (sitename !== 'btnX') {
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
