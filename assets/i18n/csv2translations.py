import sys
import pandas as pd
import json
import ntpath
import os
import argparse
import re
import unidecode

def normalize_key(k):
  return re.sub(r'[^\w\s]', '', unidecode.unidecode(k).lower()).strip().replace(' ', '_')

parser = argparse.ArgumentParser(description='Create i18n translation files from csv files https://drive.google.com/drive/u/0/folders/1nCnmTwk-7J1crFVQdlJ_29sOgpfV19Z5')
parser.add_argument('file', help='file to convert', type=str)
args = parser.parse_args()
df = pd.read_csv(args.file).fillna('')
keys = list(map(normalize_key, df['en'].values.tolist()))
os.chdir(os.path.dirname(os.path.abspath(__file__)))
for lang in df.columns:
  if lang.replace('.', '').strip():
    output_file = "{}/{}".format(lang, ntpath.basename(args.file).replace('csv', 'json'))
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf8') as jsonf:
      json.dump(dict(zip(keys, df[lang].values.tolist())), jsonf, ensure_ascii=False)
