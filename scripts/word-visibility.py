import json, collections

base = json.load(open('research/word-ui/word-controls.json', encoding='utf-8'))
rows = base['rows']
cat = {}
for line in open('research/word-ui/word-catalog.jsonl', encoding='utf-8-sig'):
    line = line.strip()
    if line:
        e = json.loads(line)
        cat[e['id']] = e

MAIN = {
    'TabHome': 'Home', 'TabInsert': 'Insert', 'TabDrawInk': 'Draw', 'TabWordDesign': 'Design',
    'TabPageLayoutWord': 'Layout', 'TabReferences': 'References', 'TabMailings': 'Mailings',
    'TabReviewWord': 'Review', 'TabView': 'View',
}

for tabid, name in MAIN.items():
    print('\n==', name)
    groups = collections.OrderedDict()
    for r in rows:
        if r['Tab'] != tabid:
            continue
        g = r['Group/Context Menu Name'] or '(top)'
        groups.setdefault(g, []).append(r)
    for g, items in groups.items():
        vis = [r for r in items if cat.get(r['Control Name'], {}).get('visible') is True]
        if g == '(top)':
            continue
        print(f"  {g:34} n={len(items):2} visible={len(vis):2}  " + ', '.join((cat.get(r['Control Name'], {}).get('label') or r['Control Name']) for r in vis)[:240])
