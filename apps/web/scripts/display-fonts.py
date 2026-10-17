"""Rebuilds the self-hosted display faces in apps/web/src/fonts/ (docs/VERSIONS.md, "Self-hosted display faces").

Each face keeps the characters listed in src/fonts/subsets.json, which display-text.test.ts checks every display
string of the content against, and only its default features. After a copy change that the test flags, add the code
points to subsets.json (and the same unicode-range to display.css), then run (docs/DEPLOY.md, "Display fonts"):
  python3 -m pip install --target /tmp/zk-fonttools fonttools==4.60.1 brotli==1.1.0 && PYTHONPATH=/tmp/zk-fonttools npm run fonts -w web
The script downloads the two upstream release archives and checks their sha256, unless they are given as arguments:
  python3 apps/web/scripts/display-fonts.py UnderCaseType_Fraunces_1.000.zip Amiri-1.003.zip
"""

import hashlib
import json
import sys
import tempfile
import urllib.request
import zipfile
from io import BytesIO
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

OUT = Path(__file__).resolve().parent.parent / "src" / "fonts"
SUBSETS = json.loads((OUT / "subsets.json").read_text())
# the features on by default (the weight-dependent glyph swaps, ligatures, kerning); not the case forms or ss01
FRAUNCES_FEATURES = ["rvrn", "liga", "kern", "mark", "mkmk", "ccmp", "locl"]
# every feature on by default for Arabic text; the stylistic sets, fractions and proportional digits are off by default
AMIRI_FEATURES = ["ccmp", "locl", "init", "medi", "fina", "rlig", "liga", "rtlm", "curs", "kern", "mark", "mkmk"]
# the upstream release archives (docs/VERSIONS.md)
ARCHIVES = [
    (
        "https://github.com/undercasetype/Fraunces/releases/download/1.000/UnderCaseType_Fraunces_1.000.zip",
        "8d8b81dfaeb89433f5c908e1d8d0a4b202bd627bd80d4cd5ff56f311fdcad19f",
    ),
    (
        "https://github.com/aliftype/amiri/releases/download/1.003/Amiri-1.003.zip",
        "81af0aff7d2086d8af24cea7202f7546130997982534691373485cd96744d05e",
    ),
]


def fetch(url: str, sha256: str, folder: Path) -> str:
    """Downloads a release archive and refuses it unless its sha256 is the recorded one."""
    path = folder / url.rsplit("/", 1)[1]
    with urllib.request.urlopen(url) as response:  # noqa: S310 (a fixed https URL)
        path.write_bytes(response.read())
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != sha256:
        sys.exit(f"{path.name}: sha256 {digest}, expected {sha256}")
    return str(path)


def codepoints(ranges: str) -> list[int]:
    """CSS unicode-range syntax (with ? wildcards) to code points."""
    points: list[int] = []
    for part in ranges.split(","):
        value = part.strip()[2:]
        low, _, high = value.partition("-")
        if "?" in low:
            low, high = low.replace("?", "0"), low.replace("?", "F")
        points.extend(range(int(low, 16), int(high or low, 16) + 1))
    return points


def write_subset(font: TTFont, ranges: str, name: str, features: list[str] | None = None) -> None:
    options = subset.Options()
    options.layout_features = features or ["*"]
    options.flavor = "woff2"
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=codepoints(ranges))
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(OUT / name)


def main(fraunces_zip: str, amiri_zip: str) -> None:
    # recalcTimestamp=False keeps the upstream timestamps, so a rebuild gives the same bytes
    # Fraunces: the variable web font with WONK fixed at 0, as Google Fonts serves it; the page uses all three remaining
    # axes (opsz through optical sizing, wght and SOFT in the hero build and the pointer weight).
    with zipfile.ZipFile(fraunces_zip) as archive:
        data = archive.read("UnderCaseType_Fraunces_1.000/Fonts - Web/Fraunces[SOFT,WONK,opsz,wght].woff2")
    fraunces = TTFont(BytesIO(data), recalcTimestamp=False)
    fraunces.flavor = None
    fraunces = instancer.instantiateVariableFont(fraunces, {"WONK": 0})
    write_subset(fraunces, SUBSETS["fraunces"]["unicodeRange"], SUBSETS["fraunces"]["file"], FRAUNCES_FEATURES)
    # Amiri Bold: the characters in subsets.json (the Arabic block, and Basic Latin for the punctuation, digits and Latin
    # names the Arabic headings carry),
    # with only the features the browser applies by default: joining, ligatures, marks, cursive attachment and kerning.
    with zipfile.ZipFile(amiri_zip) as archive:
        amiri = TTFont(BytesIO(archive.read("Amiri-1.003/Amiri-Bold.ttf")), recalcTimestamp=False)
    write_subset(amiri, SUBSETS["amiri"]["unicodeRange"], SUBSETS["amiri"]["file"], AMIRI_FEATURES)


if __name__ == "__main__":
    if len(sys.argv) == 3:
        main(sys.argv[1], sys.argv[2])
    else:
        with tempfile.TemporaryDirectory() as folder:
            main(*(fetch(url, sha256, Path(folder)) for url, sha256 in ARCHIVES))
