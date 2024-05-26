$(function () {
  'use strict';
  let settings = loadSettings();
  console.log(settings);

  let kanjiFile = 'data/kanji/' + settings.k + '.json',
      parts_not_loaded = 1 + settings.v.length;

  // Load data
  function increment_loaded() {
    parts_not_loaded--;
    if (parts_not_loaded === 0) {
      // Specify ?q=___ to query the character
      let character = gup('q');
      if (character) {
        $('#txtChar').val(character);
        $('#formChar').submit();
      }
    }
  };

  // ################################
  // Kanji

  let kanjis = {}, kanjiGroups = {};
  $.get(kanjiFile, function (data) {
    data.forEach(function (book) {
      if (book.special) {
        if (book.groups) {
          for (let key in book.groups) {
            for (let chr of book.groups[key]) {
              kanjiGroups[chr] = key;
            }
          }
        }
        return;
      }
      let bookCharElt = $('<div class=book-char>')
            .appendTo('#bookChar').hide();
      let bookListElt = $('<div>')
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
        let chapterElt = $('<p>').appendTo(bookCharElt)
          .append($('<span class=title>').text(chapter.name));
        chapter.kanji.split('').forEach(function (chr) {
          if (chr === '|') {
            chapterElt.append(' | ');
          } else if (chr === '(' || chr === ')') {
            chapterElt.append(chr);
          } else if (chr !== ' ') {
            let charSpan = $('<span class=chr>').text(chr);
            chapterElt.append(' ').append(charSpan);
            if (kanjis[chr] !== undefined) {
              console.log('Warning! Repeated character: ' + chr);
            }
            if (kanjiGroups[chr] !== undefined) {
              charSpan.addClass(kanjiGroups[chr]);
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

  let vocab_groups = [];
  settings.v.forEach(function (name, i) {
    let group = {'name': name};
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

  const BLANK = '\u3000';

  function query() {
    let c = firstChar($('#txtChar').val());
    latestQuery = c;
    latestType = 'kanji';
    // Clear the display
    $('#wordList, #jlptList').empty();
    if (!c || c === ' ') {
      $('#theChar').text(BLANK);
      $('#charDesc').hide();
      latestQuery = null;
      return;
    }
    $('#theChar').text(c);
    // Find vocab
    let pattern = new RegExp(c), addedWords = {};
    vocab_groups.forEach(function (group, i) {
      let result = $.grep(group.words, function (word) {
        return pattern.test(word);
      });
      if (result.length) {
        $('#wordList').append($('<h3>').text(group.title));
        result.forEach(function (word) {
          let wordChip = $('<a>').text(word)
            .addClass('w' + (i % 7)).appendTo('#wordList');
          if (addedWords[word]) {
            wordChip.addClass('seen');
          } else {
            addedWords[word] = true;
          }
        });
        $('#wordList').append($('<div class=clear>'));
      }
    });
    $('#charDesc').show();
    // Change highlight 
    let toHighlight = kanjis[c];
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

  $('#wordList').on('click', 'a', function () {
    latestQuery = $(this).text();
    latestType = 'vocab';
    goToSite();
  });
  
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
  const WEBSITES = {
    btnWWWJDIC: {
      kanji: '//www.edrdg.org/cgi-bin/wwwjdic/wwwjdic?1MMJ',
      vocab: '//www.edrdg.org/cgi-bin/wwwjdic/wwwjdic?1MUJ',
    },
    btnJisho: {
      kanji: '//jisho.org/search/%23kanji%20',
      vocab: '//jisho.org/search/',
    },
    btnWikiE: {
      kanji: '//en.wiktionary.org/wiki/',
      vocab: '//en.wiktionary.org/wiki/',
    },
  };

  let latestQuery = null, latestType = 'kanji';

  function goToSite() {
    let sitename = $('#selSearch').val();
    let target = '';
    if (sitename !== 'btnX' && latestQuery !== null) {
      target = WEBSITES[sitename][latestType] + latestQuery;
    }
    $('#extFrame').attr('src', target);
  }
  $('#selSearch').change(goToSite);

  // ################################
  // Reset fields

  $('#txtChar').val('');
  $('#selSearch').val('btnX');
  $('#charDesc').hide();
  $('#extFrame').attr('src', '');

});
