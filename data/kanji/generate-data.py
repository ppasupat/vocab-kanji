#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, shutil, re, argparse, json
from codecs import open
from itertools import izip
from collections import defaultdict, Counter, OrderedDict

# TODO: Make this public
from kanjitools import get_cats

def create_book(root, shortname, name):
    book = OrderedDict()
    book['shortname'] = shortname
    book['name'] = name
    book['chapters'] = []
    root.append(book)
    return book

def create_chapter(book, name, kanji):
    chapter = OrderedDict()
    chapter['name'] = name
    chapter['kanji'] = kanji
    book['chapters'].append(chapter)
    return chapter

################################
# GRADE

def grade_generator(args):
    root = []
    cats = get_cats()
    # Read onyomi groups
    onyomi_groups = dict([x for x in cats.iteritems() if x[0].startswith('JO')])
    # Read grades
    for name, cat in [
            ('E1', 'E1'), ('E2', 'E2'), ('E3', 'E3'),
            ('E4', 'E4'), ('E5', 'E5'), ('E6', 'E6'),
            ('J1', 'KK4'), ('J2', 'KK3'), ('J3', 'KK2.5'), ('J4', 'KK2')]:
        book = create_book(root, name, name)
        kanji_from_grade = set(cats[cat])
        for c1, label in zip('_KSTNHMYRW', u'アカサタナハマヤラワ'):
            kanji = []
            for c2 in 'AIUEO':
                key = 'JO' + c1 + c2
                if key not in onyomi_groups:
                    continue
                kanji.append(''.join(x for x in onyomi_groups[key] if x in kanji_from_grade))
            kanji = '|'.join(x for x in kanji if x)
            if kanji:
                create_chapter(book, label, kanji)
    return root

################################
# NEO

def neo_generator(args):
    root = []
    assert args.aux_file, 'Must specify path to grouped file'
    with open(args.aux_file, 'r', 'utf8') as fin:
        for line in fin:
            line = line.strip().split()
            if line[0] == '#':
                book = create_book(root, line[1][:2], line[1])
            else:
                create_chapter(book, line[0], line[1])
    return root

################################
# RTK

def rtk_generator(args):
    root = []
    cats = get_cats()
    for name, (m, n) in [
            ('Stories', (1, 10)), ('Plots', (11, 19)), ('Elements', (20, 56))]:
        book_id = 1
        total_chars = 99999
        for i in xrange(m, n + 1):
            chars = cats['R' + str(i)]
            if total_chars + len(chars) > {'S': 100, 'P': 125, 'E': 150}[name[0]]:
                book = create_book(root,
                        '{}{}'.format(name[0], book_id),
                        '{} {}'.format(name, book_id))
                total_chars = 0
                book_id += 1
            total_chars += len(chars)
            create_chapter(book, str(i), chars)
    return root

################################
# KKLC

def kklc_generator(args):
    root = []
    cats = get_cats()
    kklc = cats['KKLC']
    assert len(kklc) == 2300
    for i in xrange(23):
        book = create_book(root, str(i), '{}-{}'.format(i * 100 + 1, (i+1) * 100))
        for j in xrange(0, 100, 20):
            create_chapter(book, str(i * 100 + j + 1), kklc[i * 100 + j: i * 100 + j + 20])
    return root
    
################################

GENERATORS = {
        'grade': grade_generator,
        'neo': neo_generator,
        'rtk': rtk_generator,
        'kklc': kklc_generator,
        }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('name', choices=GENERATORS)
    parser.add_argument('-a', '--aux-file')
    args = parser.parse_args()

    root = GENERATORS[args.name](args)
    print json.dumps(root, ensure_ascii=False, indent=2, separators=(',', ':'))

if __name__ == '__main__':
    main()

