#!/usr/bin/env python3
from pathlib import Path
import re, sys

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('.')
skill = root / 'SKILL.md'
errors=[]
if not skill.exists(): errors.append('SKILL.md is missing')
else:
    text=skill.read_text(encoding='utf-8')
    if not text.startswith('---\n'): errors.append('SKILL.md must start with YAML frontmatter')
    if '\n---\n' not in text[4:]: errors.append('SKILL.md frontmatter closing delimiter missing')
    m=re.search(r'^name:\s*([^\n]+)$', text, re.M)
    if not m: errors.append('name is missing')
    else:
        name=m.group(1).strip()
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', name): errors.append(f'invalid skill name: {name}')
        if len(name)>64: errors.append('name exceeds 64 characters')
    d=re.search(r'^description:\s*(.+)$', text, re.M)
    if not d or not d.group(1).strip(): errors.append('description is missing')
    elif len(d.group(1).strip())>1024: errors.append('description exceeds 1024 characters')
for required in ['references','scripts','assets','evals']:
    if not (root/required).exists(): errors.append(f'missing directory: {required}')
if errors:
    print('FAIL')
    for e in errors: print('-',e)
    sys.exit(1)
print('PASS: skill structural checks')
