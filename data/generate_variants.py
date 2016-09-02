#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, re, json, argparse
from collections import defaultdict
from codecs import open

try:
    from kanjitools import get_cats
except ImportError:
    ROOT_DIR = os.path.dirname(os.path.realpath(__file__))
    sys.path.append(os.path.join(ROOT_DIR, '..', '..', '..', 'Private', 'lib'))
    from kanjitools import get_cats
cats = get_cats()

def get_shin_kyuu_map():
    kyuu_shin_pairs = (cats['BKS'] + cats['BKX'] +
                       cats['BKXH'] + cats['BKXJ'])
    shin_kyuu_map = defaultdict(set)
    for i in xrange(0, len(kyuu_shin_pairs), 2):
        kyuu = kyuu_shin_pairs[i]
        shin = kyuu_shin_pairs[i+1]
        shin_kyuu_map[shin].add(kyuu)
    return dict((x, ''.join(sorted(y)))
                for (x,y) in shin_kyuu_map.items())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('outfile')
    args = parser.parse_args()
    
    shin_kyuu_map = get_shin_kyuu_map()
    with open(args.outfile, 'w', 'utf8') as fout:
        print >> fout, '{'
        print >> fout, ',\n'.join('"%s": "%s"' % (x, y)
                                  for (x, y) in shin_kyuu_map.items())
        print >> fout, '}'
        #json.dump(shin_kyuu_map, fout, ensure_ascii=True, indent=2)

if __name__ == '__main__':
    main()
