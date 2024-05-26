#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Generates data in the sheet.

Dependencies:
- KANJIDIC: Put the following file in raw/
    http://www.edrdg.org/kanjidic/kanjidic2.xml.gz
- Unihan: Unzip the following file into raw/Unihan/
    https://www.unicode.org/Public/UNIDATA/Unihan.zip
- Kanji mapping table: Put in raw/
    https://lotus.kuee.kyoto-u.ac.jp/~chu/pubdb/LREC2012/kanji_mapping_table.txt
    (from paper https://aclanthology.org/L12-1140/)
- Kanji variant database: Download the text files to raw/cjkvi-variants/
    https://github.com/cjkvi/cjkvi-variants
"""
import argparse
import collections
import gzip
import json
import os
import re
import sys
import xml.etree.ElementTree as ET


def parse_unihan_code(x):
    return chr(int(x.split('<')[0][2:], 16))


def is_common_cjk(c):
    if len(c) > 1:
        return False
    x = ord(c)
    return (
        # CJK Unified Ideographs
        0x4E00 <= x <= 0x9FFF or
        # Extension A
        0x3400 <= x <= 0x4DBF
    )


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

    # Read Unihan
    with open('raw/Unihan/Unihan_Variants.txt') as fin:
        unihan_variants = [x.rstrip('\n').split() for x in fin if x[0] != '#']
    char_to_variants = collections.defaultdict(set)
    for row in unihan_variants:
        if not row:
            continue
        c = parse_unihan_code(row[0])
        for x in row[2:]:
            vc = parse_unihan_code(x)
            if vc != c:
                char_to_variants[c].add(vc)
                char_to_variants[vc].add(c)

    # Read Kanji variant database
    cjkvi_variants = collections.defaultdict(set)
    for filename in os.listdir('raw/cjkvi-variants/'):
        with open(f'raw/cjkvi-variants/{filename}') as fin:
            for line in fin:
                if filename == 'jp-old-style.txt':
                    fields = line.rstrip().split('\t')
                    if len(fields) >= 2 and len(fields[0]) == 1:
                        for x in fields[1:]:
                            cjkvi_variants[fields[0]].add(x.strip())
                            cjkvi_variants[x.strip()].add(fields[0])
                else:
                    fields = line.rstrip().split(',')
                    if len(fields) >= 3 and len(fields[0]) == 1:
                        cjkvi_variants[fields[0]].add(fields[2].strip())
                        cjkvi_variants[fields[2].strip()].add(fields[0])

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
        row['variants_auto'] = ''.join(sorted(
            x for x in char_to_variants[c] | cjkvi_variants[c]
            if is_common_cjk(x)))
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

