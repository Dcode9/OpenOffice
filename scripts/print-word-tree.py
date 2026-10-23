import json
t = json.load(open('research/word-ui/ribbon-tree.json', encoding='utf-8'))['tabs']
for tab, groups in t.items():
    print('\n==', tab, groups[0]['tabLabel'])
    for g in groups:
        print(f"  [{g['group']}] {g['groupLabel']!r} n={len(g['controls'])} menu={g['hasMenu']}")
        print('     ', ', '.join(c['label'] or c['id'] for c in g['controls'])[:280])
