// Utilities / Compatibility Functions

// (Array).forEach
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach
if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  };
}


function gup (name) {
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(window.location.href);
  if (results === null) {
    return "";
  } else {
    return decodeURIComponent(results[1]);
  }
}

function countObjectKeys(obj) {
  var count = 0;
  for (var x in obj)
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
  var hi, lo;
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
  var code = str.charCodeAt(0);
  var hi, low;
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