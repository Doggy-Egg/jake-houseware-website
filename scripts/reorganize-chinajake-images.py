#!/usr/bin/env python3
"""Reorganize chinajake_images folders to taxonomy names; copy files needing renames."""

from __future__ import annotations

import re
import shutil
from pathlib import Path

IMAGES_ROOT = Path("/Users/dogeegg/Desktop/chinajake_images/images")
NAME_CHANGE_ROOT = Path("/Users/dogeegg/Desktop/chinajake_images/name_change")

IMG_RE = re.compile(r"\.(jpe?g|png|webp|gif)$", re.I)
AUTO_ITEM_NO = re.compile(r"^(JK|JH|BA|WA|SH|M\d)", re.I)

TOP_MAP: dict[str, tuple[str, str]] = {
    "酒吧配件": ("酒吧器皿 barware", "酒吧配件 bar-accessories"),
    "吸管": ("酒吧器皿 barware", "酒吧配件 bar-accessories"),
    "啤酒开": ("酒吧器皿 barware", "酒吧配件 bar-accessories"),
    "调酒杯": ("酒吧器皿 barware", "调酒杯 mixing-glasses"),
    "摇酒器套装": ("套装系列 sets", "调酒师套装 bartender-sets"),
    "威士忌套装": ("套装系列 sets", "威士忌套装 whiskey-sets"),
    "小酒壶": ("生活方式配件 lifestyle-accessories", "酒壶 hip-flasks"),
    "雪茄剪": ("生活方式配件 lifestyle-accessories", "雪茄剪 cigar-cutters"),
    "红酒酒具": ("酒具配件 wine-accessories", "其他酒具配件 other-wine-accessories"),
    "杯标": ("酒具配件 wine-accessories", "酒杯标记 wine-charms"),
    "杯垫，瓶托": ("酒具配件 wine-accessories", "其他酒具配件 other-wine-accessories"),
    "冰酒石及冰块及冰模": ("威士忌配件 whiskey-accessories", "威士忌冰石 whiskey-stones"),
    "油管": ("威士忌配件 whiskey-accessories", "其他威士忌配件 other-whiskey-accessories"),
    "画册24-29页": ("厨房小工具 kitchen-gadgets", "厨房小工具 other-kitchen-gadgets"),
    "电子目录更新需要图片": ("电子目录更新 catalog-update", ""),
}

SUBCATEGORY_OVERRIDES: dict[str, str] = {
    "开瓶器小刀": "侍酒师开瓶器 waiters-corkscrews",
    "杯标": "酒杯标记 wine-charms",
}

AUX_SEGMENTS: dict[str, str] = {
    "已经修理图片": "已修图 repaired",
    "电分图": "电分图 split-exports",
    "24-25 修改后图片": "24-25页 pages-24-25",
    "26-27 修改后图片": "26-27页 pages-26-27",
    "28-29 修改后图片": "28-29页 pages-28-29",
    "2023.7.28": "2023-07-28",
    "画册24-29页": "画册24-29页 catalog-pages-24-29",
}


def is_image(path: Path) -> bool:
    return bool(IMG_RE.search(path.name))


def needs_name_change(filename: str) -> bool:
    stem = IMG_RE.sub("", filename).strip()
    return not bool(AUTO_ITEM_NO.match(stem))


def map_relative_parts(parts: tuple[str, ...]) -> list[str]:
    result: list[str] = []
    index = 0

    while index < len(parts):
        segment = parts[index]

        if segment in TOP_MAP:
            category, subcategory = TOP_MAP[segment]
            result.append(category)
            index += 1

            if subcategory:
                result.append(subcategory)

            if index < len(parts) and parts[index] in SUBCATEGORY_OVERRIDES:
                if result and subcategory:
                    result[-1] = SUBCATEGORY_OVERRIDES[parts[index]]
                else:
                    result.append(SUBCATEGORY_OVERRIDES[parts[index]])
                index += 1
            continue

        if segment in AUX_SEGMENTS:
            result.append(AUX_SEGMENTS[segment])
            index += 1
            continue

        raise ValueError(f"Unmapped path segment: {segment} in {parts!r}")

    return result


def destination_relative(file_path: Path) -> Path:
    rel = file_path.relative_to(IMAGES_ROOT)
    mapped = map_relative_parts(rel.parts[:-1])
    return Path(*mapped, rel.parts[-1])


def unique_destination(dest: Path, used: set[str]) -> Path:
    key = str(dest)
    if key not in used:
        used.add(key)
        return dest

    stem = dest.stem
    suffix = dest.suffix
    parent = dest.parent
    counter = 2
    while True:
        candidate = parent / f"{stem}__dup{counter}{suffix}"
        key = str(candidate)
        if key not in used:
            used.add(key)
            return candidate
        counter += 1


def collect_moves() -> list[tuple[Path, Path]]:
    moves: list[tuple[Path, Path]] = []
    used_destinations: set[str] = set()

    for file_path in sorted(IMAGES_ROOT.rglob("*")):
        if not file_path.is_file() or not is_image(file_path):
            continue
        dest = unique_destination(
            IMAGES_ROOT / destination_relative(file_path),
            used_destinations,
        )
        moves.append((file_path, dest))

    return moves


def remove_empty_dirs(root: Path) -> None:
    for path in sorted(root.rglob("*"), reverse=True):
        if path.is_dir():
            try:
                path.rmdir()
            except OSError:
                pass


def copy_name_change_files() -> int:
    if NAME_CHANGE_ROOT.exists():
        shutil.rmtree(NAME_CHANGE_ROOT)
    NAME_CHANGE_ROOT.mkdir(parents=True)

    copied = 0
    for file_path in sorted(IMAGES_ROOT.rglob("*")):
        if not file_path.is_file() or not is_image(file_path):
            continue
        if not needs_name_change(file_path.name):
            continue
        rel = file_path.relative_to(IMAGES_ROOT)
        out = NAME_CHANGE_ROOT / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(file_path, out)
        copied += 1

    manifest = NAME_CHANGE_ROOT / "_manifest.txt"
    lines = [
        "# Files that need a proper item-no filename (JK/JH/BA/WA/SH/M+digit)",
        f"# Total: {copied}",
        "",
    ]
    for path in sorted(NAME_CHANGE_ROOT.rglob("*")):
        if path.is_file() and path.name != "_manifest.txt":
            lines.append(str(path.relative_to(NAME_CHANGE_ROOT)))
    manifest.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return copied


def main() -> None:
    if not IMAGES_ROOT.is_dir():
        raise SystemExit(f"Missing images root: {IMAGES_ROOT}")

    moves = collect_moves()
    print(f"Planned file moves: {len(moves)}")

    moved = 0
    for src, dest in moves:
        dest.parent.mkdir(parents=True, exist_ok=True)
        if src.resolve() == dest.resolve():
            continue
        shutil.move(str(src), str(dest))
        moved += 1

    remove_empty_dirs(IMAGES_ROOT)
    print(f"Moved {moved} files in images/")

    copied = copy_name_change_files()
    print(f"Copied {copied} rename-needed files to {NAME_CHANGE_ROOT}")


if __name__ == "__main__":
    main()
