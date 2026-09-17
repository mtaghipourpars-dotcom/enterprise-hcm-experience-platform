#!/usr/bin/env python3
import json,sys
from pathlib import Path
p=Path(sys.argv[1]) if len(sys.argv)>1 else Path('assets/service-catalog/service-catalog.master.json')
data=json.loads(p.read_text(encoding='utf-8'))
errs=[]
seen=set()
required={'code','domain','personas','type','component','api','permission'}
for s in data.get('services',[]):
    if s['code'] in seen: errs.append('duplicate: '+s['code'])
    seen.add(s['code'])
    missing=required-set(s)
    if missing: errs.append(f"{s['code']}: missing {sorted(missing)}")
allowed={'PA','OM','PT','PY','TRAINING','TALENT','WORKFLOW','ANALYTICS'}
for s in data.get('services',[]):
    if s['domain'] not in allowed: errs.append(f"{s['code']}: unknown domain {s['domain']}")
if errs:
    print('FAIL'); [print('-',e) for e in errs]; sys.exit(1)
print(f"PASS: {len(data.get('services',[]))} service definitions validated")
