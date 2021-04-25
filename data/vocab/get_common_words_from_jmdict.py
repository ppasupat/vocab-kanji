#!/usr/bin/env python3

import argparse
import collections
import re
import sys

parser = argparse.ArgumentParser()
parser.add_argument('-i', '--infile', default='raw/JMdict_e')
args = parser.parse_args()


def has_kanji(word):
  return (
      any(ord('一') <= ord(x) < ord('０') for x in word)
      and not re.match('^[０-９]*[日月]$', word)
  )


stats = collections.Counter()
with open(args.infile) as fin:
  word = None
  is_common = False
  for line in fin:
    line = line.rstrip()
    m = re.match('<keb>(.*)</keb>', line)
    if m:
      word = m.group(1)
    else:
      m = re.match('<ke_pri>(.*)</ke_pri>', line)
      if m:
        if m.group(1) in ['news1', 'ichi1', 'spec1', 'spec2', 'gai1']:
          is_common = True
          stats[m.group(1)] += 1
      elif line == '</k_ele>':
        if is_common and has_kanji(word):
          print(word)
        is_common = False
        word = None
      elif line == '<k_ele>':
        assert word is None and not is_common

print(stats, file=sys.stderr)
