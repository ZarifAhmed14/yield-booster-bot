"""Verify every curated image and every archive member before a Drive upload."""
import csv
import hashlib
import json
import sys
import zipfile
from collections import Counter
from pathlib import Path
from PIL import Image

root=Path(sys.argv[1]).resolve()
curated=root/'curated'
with (curated/'manifest.csv').open(encoding='utf-8',newline='') as handle: rows=list(csv.DictReader(handle))
expected={r['file'] for r in rows}
assert len(expected)==len(rows), 'Repeated manifest filename'
assert len({r['sha256_pixels'] for r in rows})==len(rows), 'Exact pixel duplicates'
for row in rows:
    target=(curated/row['file']).resolve()
    assert target.is_relative_to(curated), 'Unsafe path'
    with Image.open(target) as image: image.verify()
actual=set(); packages=[]
for path in sorted((root/'packages').glob('*.zip')):
    assert path.stat().st_size<100*1024*1024, 'Drive part too large'
    with zipfile.ZipFile(path) as archive:
        assert archive.testzip() is None
        names=archive.namelist()
        assert not actual.intersection(names), 'Repeated archive member'
        actual.update(names)
        packages.append({'file':path.name,'images':len(names),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
assert actual==expected, 'Archive/manifest mismatch'
with (curated/'package_manifest.csv').open('w',newline='',encoding='utf-8') as handle:
    writer=csv.DictWriter(handle,fieldnames=list(packages[0]));writer.writeheader();writer.writerows(packages)
print(json.dumps({'verified_images':len(rows),'categories':dict(Counter(r['label'] for r in rows)),'packages':packages},indent=2))
