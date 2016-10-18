# Vocab-Kanji
Explore Japanese characters (kanji) using vocabulary

> <https://ppasupat.github.io/vocab-kanji/>

# Selecting a character

There are 3 ways to select a character:

* Search for a character using the search box
* Click on a pink category button and browse the characters from the list
* Add `?q=<character>` to the URL

Words containing the character will be displayed in the middle column.

# Viewing external resources

To view external references about the chosen character:

* Choose an external resource from the dropdown box
  * Since the page is served on HTTPS, while some external web pages use HTTP,
    mixed content protection has to be disabled to view some resources
* Clicking on the vocabulary also triggers a search on WWWJDIC

# Settings

Click on the cog button on the lower right of the search box to visit the settings page,
where the character set, the vocabulary sets, and other cosmetic options can be adjusted.

(The settings use HTML5 Local Storage, so IE < 8 is not supported.)

# Notes on character forms

* A proper font must be used to display Japanese characters correctly.
  The right-hand side of 海 should be have crossing lines instead of two dots,
  while the bottom of 直 should be an L instead of a horizontal line.
* For characters with variants in different Unicode code points:
  * Jouyou kanji added before 2010: shinjitai is used
  * Jouyou kanji added in 2010: for compatibility, the JIS X 0208 form is used
    for the following 4 characters: 剥 叱 填 頬.
    Otherwise, the official forms are used (e.g., 籠 instead of the ryakuji 篭).
  * Jinmeiyou and Hyougai kanji: if both variants are in the same table,
    the one resembling shinjitai is used (e.g., 遥 instead of 遙, and 醤 instead of 醬).
    Otherwise, the one in the higher-ranked table is used
    (e.g., 轟 instead of 軣).
* For characters with variants unified in the same Unicode code point:
  * Depending on the font, the character forms may differ
    (e.g., 謎 may show 辶 with either one or two dots).
  * Keep in mind that the handwritten form can be different from the printed form
    (e.g., the last two stroke of 令 is usually written as マ rather than 𠃌+丨,
    or the dots on the right-hand side 絆 is commonly written as ソ instead of ハ).
