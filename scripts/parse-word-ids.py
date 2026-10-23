import openpyxl, json, collections, os

p = r'research/office-ids/Microsoft 365/Current Channel/wordcontrols.xlsx'
wb = openpyxl.load_workbook(p, read_only=True)
ws = wb['wordcontrols']
it = ws.iter_rows(values_only=True)
hdr = next(it)
rows = []
for r in it:
    if not r or not r[0]:
        continue
    rows.append({hdr[i]: r[i] for i in range(len(hdr))})
print('rows', len(rows))
print('tabs')
for k, v in collections.Counter(x['Tab'] for x in rows).most_common():
    print(f'{v:5} {k}')
ids = []
seen = set()
for x in rows:
    if x['Control Name'] not in seen:
        seen.add(x['Control Name'])
        ids.append(x['Control Name'])
print('unique ids', len(ids))
os.makedirs('research/word-ui', exist_ok=True)
json.dump({'source': p, 'rows': rows, 'ids': ids}, open(r'research/word-ui/word-controls.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('wrote research/word-ui/word-controls.json')
