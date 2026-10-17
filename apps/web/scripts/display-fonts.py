"""Rebuilds the self-hosted display faces in apps/web/src/fonts/ (docs/VERSIONS.md, "Self-hosted display faces").

Needs fontTools 4.60.1 and brotli 1.1.0 (`python3 -m pip install --target <dir> fonttools==4.60.1 brotli==1.1.0`, then
run with PYTHONPATH=<dir>), and the two upstream release archives:
  python3 apps/web/scripts/display-fonts.py UnderCaseType_Fraunces_1.000.zip Amiri-1.003.zip
Each face keeps only the characters and default features its page sets in it.
"""

import sys
import zipfile
from io import BytesIO
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

OUT = Path(__file__).resolve().parent.parent / "src" / "fonts"
# Fraunces: Basic Latin and the typographic punctuation English copy uses
FRAUNCES_RANGE = "U+0020-007E,U+00A0,U+00B7,U+2013-2014,U+2018-201D,U+2026"
# the features on by default (the weight-dependent glyph swaps, ligatures, kerning); not the case forms or ss01
FRAUNCES_FEATURES = ["rvrn", "liga", "kern", "mark", "mkmk", "ccmp", "locl"]
# Amiri: the Arabic block, Basic Latin, and the joiners and direction marks
AMIRI_RANGE = "U+0020-007E,U+0600-06FF,U+200C-200F"
# every feature on by default for Arabic text; the stylistic sets, fractions and proportional digits are off by default
AMIRI_FEATURES = ["ccmp", "locl", "init", "medi", "fina", "rlig", "liga", "rtlm", "curs", "kern", "mark", "mkmk"]


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
    # axes (opsz through optical sizing, wght and SOFT in the hero build and the pointer weight). The same ranges are
    # the face's unicode-range in display.css.
    with zipfile.ZipFile(fraunces_zip) as archive:
        data = archive.read("UnderCaseType_Fraunces_1.000/Fonts - Web/Fraunces[SOFT,WONK,opsz,wght].woff2")
    fraunces = TTFont(BytesIO(data), recalcTimestamp=False)
    fraunces.flavor = None
    fraunces = instancer.instantiateVariableFont(fraunces, {"WONK": 0})
    write_subset(fraunces, FRAUNCES_RANGE, "fraunces-latin.woff2", FRAUNCES_FEATURES)
    # Amiri Bold: the Arabic block plus Basic Latin (the punctuation, digits and Latin names the Arabic headings carry),
    # with only the features the browser applies by default: joining, ligatures, marks, cursive attachment and kerning.
    # The same ranges are the face's unicode-range in display.css.
    with zipfile.ZipFile(amiri_zip) as archive:
        amiri = TTFont(BytesIO(archive.read("Amiri-1.003/Amiri-Bold.ttf")), recalcTimestamp=False)
    write_subset(amiri, AMIRI_RANGE, "amiri-bold.woff2", AMIRI_FEATURES)


if __name__ == "__main__":
    main(*sys.argv[1:3])
