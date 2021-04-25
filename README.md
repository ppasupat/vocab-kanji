# Vocab-Kanji
Explore Japanese characters (kanji) and their vocabulary

> <https://ppasupat.github.io/vocab-kanji/>

# Selecting a character

There are 3 ways to select a character:

* Search for a character using the search box, or ...
* Click on a category button in the first column and browse the characters from the list, or ...
* Add `?q=<character>` to the URL

Words containing the character will be displayed in the middle column.

# Viewing external references

To view external references on the chosen character:

* Choose an external reference for the kanji from the dropdown box.
* Clicking on the vocabulary also triggers a search on WWWJDIC.

The web page will be shown in the right column.

# Settings

Click on the cog button on the lower right of the search box to visit the settings page.

(The settings use HTML5 Local Storage, so IE < 8 is not supported.)

## Kanji List

* **GRADE**: [Kyouiku kanji](https://en.wikipedia.org/wiki/Ky%C5%8Diku_kanji)
  are grouped by school grades,
  while [Jouyou kanji](https://en.wikipedia.org/wiki/J%C5%8Dy%C5%8D_kanji)
  are grouped based on the 
  [Kanji Kentei](http://www.kanken.or.jp/kanken/outline/data/outline_degree_national_list.pdf) levels.
  The 2020 list (with prefecture kanji in 4th grade) is used.
  Characters are further sorted and grouped by representative readings.
* **NEO**: Ice's Hanzigong-style kanji grouping.
  Characters are grouped based on the visual "core" part
  (usually the phonetic component, but not always),
  and the cores are grouped based on themes
  (e.g., Nature includes 日, 月, 夕, 土, 山, ...).
  The characters include Jouyou kanji and a number of other common characters.
* **WANI**: [WaniKani](https://www.wanikani.com/kanji)
* **RTK**: James Heisig's [Remembering the Kanji](https://en.wikipedia.org/wiki/Remembering_the_Kanji_and_Remembering_the_Hanzi), Book 1, 6th edition.
* **KKLC**: Andrew Scott Conning's [The Kodansha Kanji Learner's Course](https://www.amazon.com/dp/1568365268),
  grouped into chunks of 200 characters.

## Vocabulary Lists

* **JLPT**: Vocabulary lists from [Jonathan Waller's website](http://www.tanos.co.uk/jlpt/).
* **JSL**: [Japanese: The Spoken Language](http://www.tanos.co.uk/jlpt/)
  published by Yale Language Press.
  These are the textbooks I used at MIT (right before they switched to Genki
  and Tobira). (Beginner to Intermediate)
* **Genki**: [Genki](http://genki.japantimes.co.jp/index_en) series.
  (Beginner)
* **Minna no Nihongo I-II**: [Minna no Nihongo](http://www.3anet.co.jp/english/books/books_01.html)
  volumes I and II (Beginner)
  ([Source](http://kyoan.u-biq.org/tangosearch.html))
* **Tobira**: [Tobira: Gateway to Advanced Japanese](http://tobiraweb.9640.jp/) (Intermediate)
* **WaniKani**: [WaniKani](https://www.wanikani.com/vocabulary)
* **Common**: Words marked (P) from [JMDict](https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project)

To be added:

* **Minna no Nihongo III-IV**: [Minna no Nihongo](http://www.3anet.co.jp/english/books/books_01.html)
  volumns III and IV (Intermediate)
* **IAIJ**: An Integrated Approach to Intermediate Japanese (Intermediate)
* **Authentic Japanese**: Authentic Japanese: Progressing from Intermediate to Advanced (Advanced)
* **Kanji in Context**: [Kanji in Context](https://www.amazon.com/dp/4789007537) (Intermediate to Advanced)
  ([Source](http://www.denisowski.org/Japanese/KIC/KIC.html))

Please suggest other lists or submit take-down notices in Github issues.

## References

* **Add localhost**: Add a "localhost" reference which opens the URL
  `http://localhost:[port]/?q=[char]` in the right column.
  Can be used to open local references (local database, scanned references, etc.)

# Notes on character forms

* A proper font must be used to display Japanese characters correctly.
  The right-hand side of 海 should be have crossing lines instead of two dots,
  while the bottom of 直 should be an L instead of a horizontal line.
* For characters with variants in different Unicode code points:
  * JIS level 1 is preferred, followed by level 2 and so on.
  * This means some characters will get a popular but hyougai shinjitai variant.
    For example, hyougai 醤 (as in shouyu) is preferred to jinmeiyou 醬,
    and hyougai 頬 is preferred to jouyou 頰.
* For characters with variants unified in the same Unicode code point:
  * Depending on the font, the character forms may differ
    (e.g., 謎 may show 辶 with either one or two dots).
  * Keep in mind that the handwritten form can be different from the printed form
    (e.g., the last two stroke of 令 is usually written as マ rather than 𠃌+丨,
    or the dots on the right-hand side 絆 is commonly written as ソ instead of ハ).
