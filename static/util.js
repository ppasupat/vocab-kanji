// Utilities / Compatibility Functions

function gup (name) {
  let regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  let results = regex.exec(window.location.href);
  if (results === null) {
    return "";
  } else {
    return decodeURIComponent(results[1]);
  }
}

function countObjectKeys(obj) {
  let count = 0;
  for (let x in obj)
    if (obj.hasOwnProperty(x))
      count++;
  return count;
}

/*
  Character Utility.
  Deal with UTF-16.
  -----
  Gracefully copied from Mozilla MDN (charCodeAt / fromCharCode)
*/

// Convert the character code into string. Correctly.
function codeToString(code) {
  if (isNaN(code)) return "";
  let hi, lo;
  if (code > 0xFFFF) {
    code = code - 0x10000;
    hi = 0xD800 + (code >> 10);
    lo = 0xDC00 + (code & 0x3FF);
    return String.fromCharCode(hi, lo);
  }
  return String.fromCharCode(code);
}

// Convert the first "character" of the string into character code.
function stringToCode(str) {
  let code = str.charCodeAt(0);
  let hi, low;
  if (0xD800 <= code && code <= 0xDBFF) {
    // High surrogate
    hi = code;
    low = str.charCodeAt(1);
    if (isNaN(low)) {
      throw 'High surrogate not followed by low surrogate in stringToCode()';
    }
    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
  } else if (0xDC00 <= code && code <= 0xDFFF) {
    // Low surrogate
    throw 'String beginning with low surrogate in stringToCode()';
  }
  return code;
}

function firstChar(str) {
  return codeToString(stringToCode(str));
}

// Settings Save / Load
const DEFAULT_SETTINGS = {
  'k': 'grade',
  'v': ['n5', 'n4', 'n3', 'n2', 'n1'],
};

function loadSettings() {
  let settings = localStorage.getItem('vocab-kanji');
  if (settings === null) {
    return DEFAULT_SETTINGS;
  }
  return JSON.parse(settings);
}

function saveSettings(settings) {
  try {
    localStorage.setItem('vocab-kanji', JSON.stringify(settings));
    return true;
  } catch (e) {
    return "ERROR: " + e.message;
  }
}
