"""Build the committed, country-sharded GeoNames catalogue from downloaded dumps.
Download cities500.zip, alternateNamesV2.zip and admin1CodesASCII.txt first.
"""
import json
import pathlib
import zipfile
import io
import subprocess

root = pathlib.Path(__file__).resolve().parents[1]
source = root / 'artifacts/geonames'
target = root / 'public/locations'
target.mkdir(parents=True, exist_ok=True)
regions = {}
region_ids = {}
for line in (source / 'admin1CodesASCII.txt').read_text(encoding='utf-8').splitlines():
    fields = line.split('\t')
    regions[fields[0]] = fields[1]
    region_ids[fields[0]] = fields[3]
with zipfile.ZipFile(source / 'cities500.zip') as archive:
    lines = archive.read('cities500.txt').decode('utf-8').splitlines()
wanted = {line.split('\t', 1)[0] for line in lines} | set(region_ids.values())
translated = {}
with zipfile.ZipFile(source / 'alternateNamesV2.zip') as archive:
    with io.TextIOWrapper(archive.open('alternateNamesV2.txt'), encoding='utf-8') as stream:
        for line in stream:
            f = line.rstrip('\n').split('\t')
            if f[1] not in wanted or f[2] != 'ru' or f[6] == '1' or f[7] == '1' or (len(f) > 9 and f[9]):
                continue
            score = (f[4] == '1', f[5] != '1')
            if f[1] not in translated or score > translated[f[1]][0]:
                translated[f[1]] = (score, f[3])
for code, geo_id in region_ids.items():
    if geo_id in translated:
        regions[code] = translated[geo_id][1]
countries = {}
for line in lines:
        f = line.split('\t')
        if not f[8] or not f[17]:
            continue
        aliases = list(dict.fromkeys([f[1], f[2], *f[3].split(',')]))
        name = translated.get(f[0], (None, f[1]))[1]
        row = [int(f[0]), name, regions.get(f[8]+'.'+f[10], f[10]),
               float(f[4]), float(f[5]), f[17], int(f[14] or 0), '|'.join(aliases)]
        countries.setdefault(f[8], []).append(row)
for code, rows in countries.items():
    rows.sort(key=lambda r: -r[6])
    (target / (code+'.json')).write_text(json.dumps(rows, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
zones = {row[5]: code for code, rows in countries.items() for row in rows}
index = {'version': '2026-09-26', 'count': sum(map(len, countries.values())), 'countries': sorted(countries), 'timezones': zones}
(root / 'src/data/city-catalog.json').write_text(json.dumps(index, indent=2)+'\n', encoding='utf-8')
subprocess.run(['node', 'scripts/build-city-labels.ts'], cwd=root, check=True)
print(json.dumps({'cities': index['count'], 'countries': len(countries), 'bytes': sum(p.stat().st_size for p in target.glob('*.json'))}))
