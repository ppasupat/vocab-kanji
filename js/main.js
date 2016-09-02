$(function () {
  "use strict";

  var vocab_xml = "data/jsl-vocablist-filtered.xml",
      jlpt_txt = "data/jlpt3-5.html",
      jlpt_2 = "data/jlpt2.html",
      kanjinetwork_json = "data/kanjinetwork.json",
      list_name = gup("list"),
      kanji_xml = {
        "extra":     "data/kanjilist-extra.xml",
        "neo":       "data/kanjilist-neo.xml",
        "henshall":  "data/kanjilist-henshall.xml",
        "kklc":      "data/kanjilist-kklc.xml",
      }[list_name] || "data/kanjilist.xml",
      parts_not_loaded = 5;

  // Load data
  function increment_loaded() {
    parts_not_loaded--;
    if (parts_not_loaded === 0) {
      // Specify ?q=___ to query the character
      var character = gup("q");
      if (character) {
        $("#txtChar").val(character);
        $("#formChar").submit();
      }
    }
  };

  var words = [];
  $.get(vocab_xml, function (data) {
    $(data).find("chapter").each(function (index, elt) {
      var chapter_name = $(elt).attr("name");
      $(elt).text().split("\n").forEach(function (word) {
        if (word) {
          words.push([word, chapter_name]);
        }
      });
    });
    increment_loaded();
  });

  var jlptWords = [], jlpt2Words = [];
  $.get(jlpt_txt, function (data) {
    data.split("\n").forEach(function (word) {
      jlptWords.push(word);
    });
    increment_loaded();
  });
  $.get(jlpt_2, function (data) {
    data.split("\n").forEach(function (word) {
      jlpt2Words.push(word);
    });
    increment_loaded();
  });

  var kanjis = {};
  $.get(kanji_xml, function (data) {
    var extras = {}, h5 = {}, h6 = {}, h6x = {}, moved = {},
        originals = {}, jouyou = {}, chrCnt = 0;
    $(data).find("extra chapter").each(function (index, elt) {
      var type = $(elt).attr("type"), name = $(elt).attr("name"),
          target = undefined;
      if (type === "kyouiku") {
        target = extras;
      } else if (type === "moved") {
        target = moved;
      } else if (type === "harvard") {
        if (name === "5") {
          target = h5;
        } else if (name === "6") {
          target = h6;
        } else if (name === "6x") {
          target = h6x;
        }
      } else if (type === 'jouyou') {
        target = jouyou;
      }
      if (target) {
        $(elt).text().split("").forEach(function (chr) {
          target[chr] = true;
        });
      }
    });
    $(data).find("originals").text().split("").forEach(function (chr) {
      originals[chr] = true;
    });
    $(data).find("book").each(function (index, elt) {
      var bookNode = $(elt);
      var bookCharElt = $("<div>").addClass("book-char")
            .appendTo($("#bookChar")).hide();
      var bookListElt = $("<div>")
            .addClass("book-list pink-button unselectable")
            .text(bookNode.attr("shortname"))
            .appendTo($("#bookList"))
            .click(function () {
              $(".book-list").removeClass("active");
              $(".book-char").hide();
              bookListElt.addClass("active");
              bookCharElt.show();
            });
      var addenda = {};
      bookNode.find("addendum").text().split("").forEach(function (chr) {
        if (addenda[chr] !== undefined) {
          console.log("Warning! Repeated addendum character: " + chr);
        }
        addenda[chr] = true;
      });
      bookNode.find("chapter").each(function (index, elt) {
        var chapterNode = $(elt);
        var currentChapter = chapterNode.text().split("");
        var toBeAdded = $("<p>");
        toBeAdded.append($("<span>").addClass("title")
                         .text(chapterNode.attr("name")));
        currentChapter.forEach(function (chr) {
          if (chr === "|") {
            toBeAdded.append(" | ");
          } else if (chr === '(' || chr === ')') {
            toBeAdded.append(chr);
          } else if (chr !== "" && chr !== " ") {
            if (originals[chr]) {
              chrCnt += 1;
              if (chrCnt % 100 == 1 && chrCnt > 1) {
                var s = String.fromCharCode(9311 + chrCnt/100);
                toBeAdded.append(" " + s);
              }
            }
            var charSpan = $("<span class='chr'>").text(chr);
            toBeAdded.append(" ").append(charSpan);
            if (kanjis[chr] !== undefined) {
              console.log("Warning! Repeated character: " + chr);
            }
            kanjis[chr] = [bookListElt, charSpan];
            if (list_name === "extra" && !originals[chr]) {
              if (h5[chr]) {
                charSpan.addClass("h5");
              } else if (h6[chr]) {
                charSpan.addClass("h6");
              } else if (h6x[chr]) {
                charSpan.addClass("h6x");
              } else if (extras[chr]) {
                charSpan.addClass("extra");
              } else {
                charSpan.addClass("what");
              }
              if (addenda[chr]) {
                charSpan.addClass("addendum");
                delete addenda[chr];
              }
            } else if (list_name === 'neo') {
              if (!jouyou[chr]) {
                charSpan.addClass("extra");
              }
            }
            if (moved[chr]) {
              charSpan.addClass("moved");
            }
          }
        });
        if (countObjectKeys(addenda.length) !== 0) {
          console.log("Warning! Remaining addendum characters:");
          console.log(addenda);
        }
        bookCharElt.append(toBeAdded);
      });
    });
    increment_loaded();
  });

  /////////

  $("#bookChar").on("click", ".chr", function () {
    $("#txtChar").val($(this).text());
    $("#formChar").submit();
  });

  // Query functions
  var colorCode = function (word) {
    var s = "60%";
    var l = "85%";
    var h;
    if (word <= "JSL 06 B") {
      h = 0;
    } else if (word <= "JSL 12 B") {
      h = 60;
    } else if (word <= "JSL 17 B") {
      h = 120;
    } else if (word <= "JSL 22 B") {
      h = 180;
    } else if (word <= "JSL 27 B") {
      h = 240;
    } else if (word <= "JSL 30 B") {
      h = 300;
    } else {
      h = 360;
    }
    return 'hsl(' + h + ',' + s + ',' + l + ')';
  };

  var BLANK = "\u3000";

  var wwwjdicUrl = "http://www.edrdg.org/cgi-bin/wwwjdic/wwwjdic?1MUJ";
  var getAnchor = function (text) {
    return $("<a>").text(text)
      .attr('href', wwwjdicUrl + text)
      .attr('target', 'extFrame');
  }

  var query = function () {
    var c = firstChar($("#txtChar").val());
    // Clear the display
    $("#wordList, #jlptList").empty();
    if (!c || c === " ") {
      $("#theChar").text(BLANK);
      $("#charDesc").hide();
      return;
    }
    $("#theChar").text(c);
    var pattern = new RegExp(c);
    $.grep(words, function (tuple, index) {
      return pattern.test(tuple[0]);
    }).forEach(function (tuple) {
      $("#wordList").append(getAnchor(tuple[0])
                            .css("background-color", 
                                 colorCode(tuple[1])));
    });
    $.grep(jlptWords, function (word, index) {
      return pattern.test(word);
    }).forEach(function (word) {
      $("#jlptList").append(getAnchor(word));
    });
    $.grep(jlpt2Words, function (word, index) {
      return pattern.test(word);
    }).forEach(function (word) {
      $("#jlptList").append(getAnchor(word).addClass('n2'));
    });
    $("#charDesc").show();
    
    var toHighlight = kanjis[c];
    $(".chr").removeClass("highlight");
    if (toHighlight) {
      toHighlight[0].click();
      toHighlight[1].addClass("highlight");
    } else {
      $(".book-list").removeClass("active");
      $(".book-char").hide();
    }
    goToSite();
  };
  
  $("#formChar").submit(function (event) {
    query();
    return false;
  });
  $("#txtChar").change(function (event) {
    $("#formChar").submit();
  });

  // Resize txtChar
  $("#txtChar").focus(function (event) {
    $("#txtChar").width("7em");
    $("#selSearch").hide();
  });
  $("#txtChar").blur(function (event) {
    $("#txtChar").width("1.5em");
    $("#selSearch").show();
  });

  // Search functions
  var websites = {
    btnWWWJDIC: "http://www.edrdg.org/cgi-bin/wwwjdic/wwwjdic?1MMJ",
    btnYamasa: "http://www.yamasa.cc/ocjs/kanjidic.nsf/SortedByKanji2THEnglish/",
    btnKDamage: "http://kanjidamage.com/kanji/search?q=",
    btnWikiE: "http://en.wiktionary.org/wiki/",
    btnWikiJ: "http://ja.wiktionary.org/wiki/",
    btnKotobank: "https://kotobank.jp/word/",
    btnCEty: "http://www.chineseetymology.org/CharacterEtymology.aspx?characterInput=",
    btnCChr: "http://chinese-characters.org/cgi-bin/lookup.cgi?characterInput=",
    btnChise: "http://www.chise.org/chisewiki/view.cgi?character=",
    btnNico: "http://dic.nicovideo.jp/a/",
    btnKago: "https://dl.dropboxusercontent.com/u/7408879/kago/index.html#",
    btnXiu: "https://dl.dropboxusercontent.com/u/7408879/xiuwenyuan/index.html?",
    btnKNet: "http://www.kanjinetworks.com/eng/kanji-dictionary/online-kanji-etymology-dictionary.cfm?kanji_id=",
    btnZDic: "http://www.zdic.net/sousuo?q=",
    btnGGArt: "http://www.iguci.cn/dictionary/dcontent.php?word=",
    btnYB: "http://www.yellowbridge.com/chinese/character-etymology.php?zi=",
  };
  var kanjinetwork_mapping;
  $.getJSON(kanjinetwork_json, function (data) {
    kanjinetwork_mapping = data;
    increment_loaded();
  });

  var goToSite = function () {
    if ($("#theChar").text() === BLANK) return;
    var sitename = $("#selSearch").val();
    var target = "";
    if (sitename === "btnKNet") {
      target = websites[sitename] + kanjinetwork_mapping[$("#theChar").text()];
    } else if (sitename !== "btnX") {
      target = websites[sitename] + $("#theChar").text();
    }
    $("#extFrame").attr('src', target);
  };
  $("#selSearch").change(goToSite);

  // Layout functions
  var resizer = function () {
    var sel_height = ($(window).height() - 20
                      - $("#charSelUpper").outerHeight(true));
    $("#charSelLower").height(sel_height);
    var desc_height = ($(window).height() - 20
                       - $("#charDispInner").outerHeight(true));
    $("#charDesc").height(desc_height);
  };
  $(window).resize(resizer);
  resizer();

  // Reset fields
  $("#txtChar").val("");
  $("#selSearch").val("btnX");
  $("#charDesc").hide();
  $("#extFrame").attr('src', "");

});
