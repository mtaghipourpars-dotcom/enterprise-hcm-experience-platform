#!/usr/bin/env python3
import json,sys
from pathlib import Path
fa=Path('locales/fa.json'); en=Path('locales/en.json')
if not fa.exists() or not en.exists():
    print('INFO: locale files are expected in the application repository; package-level check skipped')
    sys.exit(0)
a=json.loads(fa.read_text(encoding='utf-8')); b=json.loads(en.read_text(encoding='utf-8'))
ka=set(a); kb=set(b)
miss_a=sorted(kb-ka); miss_b=sorted(ka-kb)
if miss_a or miss_b:
    print('FAIL'); print('Missing in fa:',miss_a); print('Missing in en:',miss_b); sys.exit(1)
print('PASS: FA/EN translation keys aligned')
