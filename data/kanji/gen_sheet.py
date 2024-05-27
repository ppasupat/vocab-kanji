#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Generates data in the sheet.

Dependencies:
- KANJIDIC: Put the following file in raw/
    http://www.edrdg.org/kanjidic/kanjidic2.xml.gz
- Kanji mapping table: Put in raw/
    https://lotus.kuee.kyoto-u.ac.jp/~chu/pubdb/LREC2012/kanji_mapping_table.txt
    (from paper https://aclanthology.org/L12-1140/)
"""
import argparse
import collections
import gzip
import json
import os
import re
import sys
import xml.etree.ElementTree as ET


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-v', '--verbose', action='store_true')
    parser.add_argument('old_sheet')
    args = parser.parse_args()

    with open(args.old_sheet) as fin:
        data = [line.rstrip('\n').split('\t') for line in fin]

    header = data[0]
    data = [{key: value for (key, value) in zip(header, row)} for row in data[1:]]

    # Read KANJIDIC
    with gzip.open('raw/kanjidic2.xml.gz') as fin:
        char_to_kanjidic = {}
        for ctag in ET.parse(fin).getroot().findall('character'):
            c = ctag.find('literal').text
            char_to_kanjidic[c] = ctag

    # Read Simplified variants
    with open('raw/kanji_mapping_table.txt') as fin:
        kanji_simp = [x.rstrip('\n').split('\t') for x in fin]
    kanji_simp = {x[0]: x[2].replace(',', '') for x in kanji_simp if len(x) == 3}

    # Read Kanken levels
    with open('kanken.json') as fin:
        kanken_to_chars = json.load(fin)
    char_to_kanken = {}
    for kanken, chars in kanken_to_chars.items():
        for c in chars:
            assert c not in char_to_kanken
            char_to_kanken[c] = kanken

    # Read Kyuu-Shin mapping
    with open('kyuu-shin.json') as fin:
        kyuu_shin = json.load(fin)
    shin_kyuu = {}
    for kyuu, shin in kyuu_shin.items():
        shin_kyuu[shin] = shin_kyuu.get(shin, '') + kyuu

    # Refresh data
    for row in data:
        c = row['char']
        row['kanken'] = char_to_kanken.get(c, 'K1')
        row['kyuu_auto'] = shin_kyuu.get(c, '')
        row['simp_auto'] = kanji_simp[c]
        ctag = char_to_kanjidic[c]
        row['all_ons'] = ', '.join(
                x.text for x in ctag.findall('.//reading[@r_type="ja_on"]'))
        row['all_kuns'] = ', '.join(
                x.text for x in ctag.findall('.//reading[@r_type="ja_kun"]'))
        row['all_meanings'] = ', '.join(
                x.text for x in ctag.findall('.//meaning')
                if 'm_lang' not in x.attrib)

    print('\t'.join(header))
    for row in data:
        print('\t'.join(str(row.get(key, '')) for key in row))


if __name__ == '__main__':
    main()

