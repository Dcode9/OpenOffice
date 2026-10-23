import json, csv, collections

base = json.load(open('research/word-ui/word-controls.json', encoding='utf-8'))
rows = base['rows']

cat = {}
for line in open('research/word-ui/word-catalog.jsonl', encoding='utf-8-sig'):
    line = line.strip()
    if not line:
        continue
    e = json.loads(line)
    cat[e['id']] = e

def label(cid):
    e = cat.get(cid)
    if not e:
        return ''
    return e.get('label') or ''

tabs = collections.OrderedDict()
for r in rows:
    tab = r['Tab'] or 'None'
    group = r['Group/Context Menu Name'] or ''
    tabs.setdefault(tab, collections.OrderedDict()).setdefault(group, []).append(r)

MAIN_TABS = [
    'TabHome', 'TabInsert', 'TabDrawInk', 'TabWordDesign', 'TabPageLayoutWord',
    'TabReferences', 'TabMailings', 'TabReviewWord', 'TabView', 'TabDeveloper', 'TabHelp',
]

tree = collections.OrderedDict()
for tab in MAIN_TABS:
    for group, items in tabs.get(tab, {}).items():
        chev = any((r['Control Type'] or '') in ('menu', 'splitButton', 'dropDown', 'gallery') for r in items)
        g = {
            'tab': tab,
            'tabLabel': label(tab),
            'group': group,
            'groupLabel': label(group) if group else '',
            'controls': [
                {
                    'id': r['Control Name'],
                    'label': label(r['Control Name']),
                    'type': r['Control Type'],
                    'parent': r['Parent Control'],
                    'secondaryParent': r['Secondary Parent Control'],
                    'hasMenu': (r['Control Type'] or '') in ('menu', 'splitButton', 'dropDown', 'gallery'),
                }
                for r in items
            ],
            'hasMenu': chev,
        }
        tree.setdefault(tab, []).append(g)

out = {
    'source': base['source'],
    'wordVersion': '16.0',
    'note': 'Labels/tips read from the installed Word 16.0 CommandBars API (hidden instance). Structure from Microsoft 365 Current Channel wordcontrols.xlsx.',
    'tabs': tree,
}
json.dump(out, open('research/word-ui/ribbon-tree.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

with open('research/word-ui/word-controls.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['id', 'label', 'type', 'tab', 'group', 'parent', 'secondaryParent', 'screentip', 'supertip', 'enabled', 'visible', 'pressed'])
    for r in rows:
        cid = r['Control Name']
        e = cat.get(cid, {})
        w.writerow([
            cid, e.get('label') or '', r['Control Type'] or '', r['Tab'] or '', r['Group/Context Menu Name'] or '',
            r['Parent Control'] or '', r['Secondary Parent Control'] or '',
            e.get('screentip') or '', (e.get('supertip') or '').replace('\n', ' '),
            e.get('enabled'), e.get('visible'), e.get('pressed'),
        ])

print('tabs in tree:', len(tree))
for tab, groups in tree.items():
    n = sum(len(g['controls']) for g in groups)
    print(f'{tab:22} {label(tab):16} groups={len(groups):2} controls={n}')
print('unique catalog entries:', len(cat), 'labels:', sum(1 for e in cat.values() if e.get('label')))
