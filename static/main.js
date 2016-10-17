$(function () {
  'use strict';
  var settings = loadSettings();
  console.log(settings);

  var kanjiFile = 'data/kanji/' + settings.k + '.json';

  var vocab_xml = 'data/jsl-vocablist-filtered.xml',
      jlpt_txt = 'data/jlpt3-5.html',
      jlpt_2 = 'data/jlpt2.html',
      kago_json = 'data/kago.json',
      xiuwenyuan_json = 'data/xiuwenyuan.json',
      parts_not_loaded = 6;

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

  var words = [];
  $.get(vocab_xml, function (data) {
    $(data).find('chapter').each(function (index, elt) {
      var chapter_name = $(elt).attr('name');
      $(elt).text().split('\n').forEach(function (word) {
        if (word) {
          words.push([word, chapter_name]);
        }
      });
    });
    increment_loaded();
  });

  var jlptWords = [], jlpt2Words = [];
  $.get(jlpt_txt, function (data) {
    data.split('\n').forEach(function (word) {
      jlptWords.push(word);
    });
    increment_loaded();
  });
  $.get(jlpt_2, function (data) {
    data.split('\n').forEach(function (word) {
      jlpt2Words.push(word);
    });
    increment_loaded();
  });

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

  /////////

  $('#bookChar').on('click', '.chr', function () {
    $('#txtChar').val($(this).text());
    $('#formChar').submit();
  });

  // Query functions
  var colorCode = function (word) {
    var s = '60%';
    var l = '85%';
    var h;
    if (word <= 'JSL 06 B') {
      h = 0;
    } else if (word <= 'JSL 12 B') {
      h = 60;
    } else if (word <= 'JSL 17 B') {
      h = 120;
    } else if (word <= 'JSL 22 B') {
      h = 180;
    } else if (word <= 'JSL 27 B') {
      h = 240;
    } else if (word <= 'JSL 30 B') {
      h = 300;
    } else {
      h = 360;
    }
    return 'hsl(' + h + ',' + s + ',' + l + ')';
  };

  var BLANK = '\u3000';

  var wwwjdicUrl = 'http://www.edrdg.org/cgi-bin/wwwjdic/wwwjdic?1MUJ';
  var getAnchor = function (text) {
    return $('<a>').text(text)
      .attr('href', wwwjdicUrl + text)
      .attr('target', 'extFrame');
  }

  var query = function () {
    var c = firstChar($('#txtChar').val());
    // Clear the display
    $('#wordList, #jlptList').empty();
    if (!c || c === ' ') {
      $('#theChar').text(BLANK);
      $('#charDesc').hide();
      return;
    }
    $('#theChar').text(c);
    var pattern = new RegExp(c);
    $.grep(words, function (tuple, index) {
      return pattern.test(tuple[0]);
    }).forEach(function (tuple) {
      $('#wordList').append(getAnchor(tuple[0])
                            .css('background-color', 
                                 colorCode(tuple[1])));
    });
    $.grep(jlptWords, function (word, index) {
      return pattern.test(word);
    }).forEach(function (word) {
      $('#jlptList').append(getAnchor(word));
    });
    $.grep(jlpt2Words, function (word, index) {
      return pattern.test(word);
    }).forEach(function (word) {
      $('#jlptList').append(getAnchor(word).addClass('n2'));
    });
    $('#charDesc').show();
    
    var toHighlight = kanjis[c];
    $('.chr').removeClass('highlight');
    if (toHighlight) {
      toHighlight[0].click();
      toHighlight[1].addClass('highlight');
    } else {
      $('.book-list').removeClass('active');
      $('.book-char').hide();
    }
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

  // Search functions
  var websites = {
    btnWWWJDIC: 'http://www.edrdg.org/cgi-bin/wwwjdic/wwwjdic?1MMJ',
    btnYamasa: 'http://www.yamasa.cc/ocjs/kanjidic.nsf/SortedByKanji2THEnglish/',
    btnKDamage: 'http://kanjidamage.com/kanji/search?q=',
    btnWikiE: 'http://en.wiktionary.org/wiki/',
    btnWikiJ: 'http://ja.wiktionary.org/wiki/',
    btnKotobank: 'https://kotobank.jp/word/',
    btnCEty: 'http://www.chineseetymology.org/CharacterEtymology.aspx?characterInput=',
    btnCChr: 'http://chinese-characters.org/cgi-bin/lookup.cgi?characterInput=',
    btnChise: 'http://www.chise.org/chisewiki/view.cgi?character=',
    btnNico: 'http://dic.nicovideo.jp/a/',
    btnKago: 'http://www5b.biglobe.ne.jp/~shu-sato/kanji/kago.htm',
    btnKNet: 'http://www.kanjinetworks.com/eng/kanji-dictionary/online-kanji-etymology-dictionary.cfm?kanji_id=',
    btnZDic: 'http://www.zdic.net/sousuo?q=',
    btnGGArt: 'http://www.iguci.cn/dictionary/dcontent.php?word=',
    btnXiu: 'http://www.xiuwenyuan.com/ziyuan/',
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
