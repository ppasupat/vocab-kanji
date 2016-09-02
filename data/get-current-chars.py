#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, re, argparse, json
from codecs import open
from collections import defaultdict
import xml.etree.ElementTree as ET

ROOT_DIR = os.path.dirname(os.path.realpath(__file__))
PATH = os.path.join(ROOT_DIR, 'kanjilist-extra.xml')

try:
    from kanjitools import get_cats
except ImportError:
    sys.path.append(os.path.join(ROOT_DIR, '..', '..', '..',
                                 'Private', 'lib'))
    from kanjitools import get_cats
cats = get_cats()

def get_chars(filename, tag_name='chapter'):
    tree = ET.parse(filename)
    root = tree.getroot()
    chapters = [y for x in root.getchildren() for y in x.getchildren()
                if x.tag == 'book' and y.tag == tag_name]
    characters = ''
    for book in chapters:
        for x in book.itertext():
            characters += x
    return ''.join(x for x in characters if ord(x) > 127)
    
def get_addenda(filename):
    return get_chars(filename, tag_name='addendum')

def print_problematic_chars(characters):
    characters = set(characters)
    problematic = defaultdict(str)
    for key in ('B7+', 'B7X+', 'B7-', 'E8', 'E9', 'B7*', 'B7X*', 'BI', 'BKX', 'BKXH', 'BKXJ'):
        for x in characters & set(cats[key]):
            problematic[x] += key[-1]
    problematic = [(value, key) for (key, value) in problematic.iteritems()]
    for value, key in sorted(problematic):
        print key, value

def check(characters, addenda):
    # Check for duplicates
    seen = set()
    for c in characters:
        if c in seen:
            print 'Repeated Character: %s' % c
        seen.add(c)
    # Check with the original list
    characters = seen
    vk = set(cats['VK'])
    notfound = vk - characters
    if notfound:
        print 'Missing:', ' '.join(sorted(notfound))
    else:
        print 'Missing: None!'
    # Addenda
    seen = set()
    for c in addenda:
        if c in seen:
            print 'Repeated Addendum: %s' % c
        if c not in characters:
            print 'Addendum Outside Character List: %s' % c
        if c in vk:
            print 'Addendum Inside Vocab-Kanji List: %s' % c
        seen.add(c)
    print 'Vocab-Kanji: %6d' % len(vk)
    print '      Extra: %6d' % len(characters - vk)
    print '            (%6d total)' % len(characters)
    print '    Addenda: %6d' % len(addenda)
    print '            (%6d left)' % len(characters - vk - set(addenda))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', '--filename', default=PATH)
    parser.add_argument('-p', '--problems', action="store_true",
                        help="print only problematic kanji")
    parser.add_argument('-c', '--check', action="store_true",
                        help="check the original vocab-kanji kanji")
    parser.add_argument('-s', '--sort', action="store_true",
                        help="sort output by unicode order")
    args = parser.parse_args()

    characters = get_chars(args.filename)
    if args.sort:
        characters = ''.join(sorted(characters))
    if args.problems:
        print_problematic_chars(characters)
    else:
        print ''.join(characters)
    if args.check:
        addenda = get_addenda(args.filename)
        check(characters, addenda)

if __name__ == '__main__':
    main()
