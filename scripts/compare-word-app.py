import json, re, difflib

word = json.load(open('research/word-ui/word-top-controls.json', encoding='utf-8'))
app = json.load(open('research/word-ui/app-ribbon.json', encoding='utf-8'))

def norm(s):
    s = (s or '').replace('\u2011', '-').replace('\u2013', '-')
    s = re.sub(r'\.\.\.$', '', s.strip())
    s = re.sub(r'[:：]$', '', s).strip()
    s = s.replace('&', 'and')
    return re.sub(r'\s+', ' ', s).lower()

def words(s):
    return [w for w in re.split(r'[^a-z0-9]+', norm(s)) if w]

def score(a, b):
    na, nb = norm(a), norm(b)
    if not na or not nb:
        return 0
    if na == nb:
        return 1
    if na in nb or nb in na:
        return 0.9
    return difflib.SequenceMatcher(None, na, nb).ratio()

for tab, wgroups in word.items():
    if tab not in app:
        continue
    agroups = app[tab]['groups']
    print(f'\n=== {tab}')
    for wg in wgroups:
        name = wg['label']
        if not name:
            continue
        matching = max(agroups, key=lambda g: score(name, g['label'])) if agroups else None
        gs = score(name, matching['label']) if matching else 0
        if gs < 0.6:
            print(f'  GROUP MISSING: {name!r}  (word top: {", ".join(c["label"] for c in wg["controls"])})')
            continue
        alabels = []
        for c in matching['controls']:
            alabels.append(c['title'] or c['text'])
        used = set()
        missing = []
        for wc in wg['controls']:
            best = max(range(len(alabels)), key=lambda i: score(wc['label'], alabels[i])) if alabels else -1
            bs = score(wc['label'], alabels[best]) if best >= 0 else 0
            if bs >= 0.74 and best not in used:
                used.add(best)
            else:
                missing.append(wc['label'])
        if missing:
            print(f'  {name}: MISSING WORD -> {missing}')
        extra = [alabels[i] for i in range(len(alabels)) if i not in used]
        if extra:
            shown = [e for e in extra if e and not e.startswith('False')]
            if shown:
                print(f'  {name}: APP EXTRA -> {shown}')
