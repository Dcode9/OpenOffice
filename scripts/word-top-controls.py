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

def lbl(r):
    e = cat.get(r['Control Name'], {})
    return e.get('label') or r['Control Name']

tree = {}
for tabid, name in MAIN.items():
    groups = collections.OrderedDict()
    for r in rows:
        if r['Tab'] != tabid or not r['Group/Context Menu Name']:
            continue
        groups.setdefault(r['Group/Context Menu Name'], []).append(r)
    glist = []
    for g, items in groups.items():
        vis = [r for r in items if cat.get(r['Control Name'], {}).get('visible') is True]
        top = [r for r in vis if not r['Parent Control']]
        if not top:
            continue
        glist.append({
            'id': g,
            'label': next((lbl(r) for r in top if lbl(r) == g), g),
            'controls': [{'id': r['Control Name'], 'label': lbl(r), 'type': r['Control Type']} for r in top],
        })
    tree[name] = glist
    print('\n==', name)
    for g in glist:
        print(f"  {g['label']!r:26} " + ' | '.join(f"{c['label']} [{c['type']}]" for c in g['controls']))

json.dump(tree, open('research/word-ui/word-top-controls.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
