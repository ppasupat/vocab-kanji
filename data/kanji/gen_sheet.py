#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import collections
import json
import os
import re
import sys


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-v', '--verbose', action='store_true')
    parser.add_argument('old_sheet')
    args = parser.parse_args()

    with open(args.old_sheet) as fin:
        data = [line.rstrip('\n').split('\t') for line in fin]

    header = data[0]
    data = [{key: value for (key, value) in zip(header, row)} for row in data[1:]]

    print('\t'.join(header))
    for row in data:
        print('\t'.join(str(row.get(key, '')) for key in row))


if __name__ == '__main__':
    main()

