"""Rebuilds the self-hosted display faces in apps/web/src/fonts/ (docs/VERSIONS.md, "Self-hosted display faces").

Needs fontTools 4.60.1 and brotli 1.1.0 (`python3 -m pip install --target <dir> fonttools==4.60.1 brotli==1.1.0`, then
run with PYTHONPATH=<dir>), and the two upstream release archives:
  python3 apps/web/scripts/display-fonts.py UnderCaseType_Fraunces_1.000.zip Amiri-1.003.zip
The subsets are Google Fonts' unicode ranges, as next/font served these faces before they were self-hosted.
"""

import sys
import zipfile
from io import BytesIO
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

OUT = Path(__file__).resolve().parent.parent / "src" / "fonts"
LATIN = "U+??,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
LATIN_EXT = "U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF"
ARABIC = "U+6??,U+750-77F,U+870-891,U+897-8E1,U+8E3-8FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC,U+102E0-102FB,U+10E60-10E7E,U+10EC2-10EC7,U+10EC9-10EEE,U+10EF?,U+1EE00-1EE03,U+1EE05-1EE1F,U+1EE21-1EE22,U+1EE24,U+1EE27,U+1EE29-1EE32,U+1EE34-1EE37,U+1EE39,U+1EE3B,U+1EE42,U+1EE47,U+1EE49,U+1EE4B,U+1EE4D-1EE4F,U+1EE51-1EE52,U+1EE54,U+1EE57,U+1EE59,U+1EE5B,U+1EE5D,U+1EE5F,U+1EE61-1EE62,U+1EE64,U+1EE67-1EE6A,U+1EE6C-1EE72,U+1EE74-1EE77,U+1EE79-1EE7C,U+1EE7E,U+1EE80-1EE89,U+1EE8B-1EE9B,U+1EEA1-1EEA3,U+1EEA5-1EEA9,U+1EEAB-1EEBB,U+1EEF0-1EEF1"


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


def write_subset(font: TTFont, ranges: str, name: str) -> None:
    options = subset.Options()
    options.layout_features = ["*"]
    options.flavor = "woff2"
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=codepoints(ranges))
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(OUT / name)


def main(fraunces_zip: str, amiri_zip: str) -> None:
    # recalcTimestamp=False keeps the upstream timestamps, so a rebuild gives the same bytes
    # Fraunces: the variable web font with WONK fixed at 0, as Google Fonts serves it (axes opsz, wght, SOFT)
    with zipfile.ZipFile(fraunces_zip) as archive:
        data = archive.read("UnderCaseType_Fraunces_1.000/Fonts - Web/Fraunces[SOFT,WONK,opsz,wght].woff2")
    fraunces = TTFont(BytesIO(data), recalcTimestamp=False)
    fraunces.flavor = None
    fraunces = instancer.instantiateVariableFont(fraunces, {"WONK": 0})
    write_subset(fraunces, LATIN, "fraunces-latin.woff2")
    # Amiri Bold: Arabic, Latin and Latin Extended in one file
    with zipfile.ZipFile(amiri_zip) as archive:
        amiri = TTFont(BytesIO(archive.read("Amiri-1.003/Amiri-Bold.ttf")), recalcTimestamp=False)
    write_subset(amiri, ",".join([ARABIC, LATIN, LATIN_EXT]), "amiri-bold.woff2")


if __name__ == "__main__":
    main(*sys.argv[1:3])
