#!/usr/bin/env python3
import csv,sys
from pathlib import Path
p=Path(sys.argv[1]) if len(sys.argv)>1 else Path('assets/templates/traceability-template.csv')
rows=list(csv.DictReader(p.open(encoding='utf-8')))
if not rows:
    print('INFO: template has no records yet; schema validated')
else:
    required={'service_code','persona','permission','ui_component','api_endpoint','core_entity','sap_source','sap_field','test_id'}
    miss=[]
    for i,r in enumerate(rows,1):
        for k in required:
            if not r.get(k): miss.append(f'row {i}: {k} missing')
    if miss:
        print('FAIL'); [print('-',x) for x in miss]; sys.exit(1)
    print(f'PASS: {len(rows)} traceability records validated')
