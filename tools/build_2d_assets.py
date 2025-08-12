# Ready-to-run 2D assets packer for Supabase
# Requires: pip install requests pillow tqdm
# Usage (from repo root):
#   python tools/build_2d_assets.py
# The script reads ./manifest_2d_assets.json, downloads assets, generates previews,
# writes ./dnd-2d-assets/assets.csv, and creates ./dnd-2d-assets.zip

import os, json, zipfile, io, shutil, csv, sys, re
from pathlib import Path

# external deps
try:
    import requests
except Exception as e:
    print("Install dependency: pip install requests pillow tqdm")
    raise
try:
    from PIL import Image
except Exception as e:
    print("Install dependency: pip install pillow")
    raise
try:
    from tqdm import tqdm
except Exception as e:
    print("Install dependency: pip install tqdm")
    raise

ALLOWED_CATS = {"characters","mobs","bosses","props","animals","tilesets","icons"}
IMG_EXT = {".png",".jpg",".jpeg",".webp"}

def slugify(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "asset"

def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)

def download_file(url: str) -> bytes:
    with requests.get(url, stream=True, timeout=60) as r:
        r.raise_for_status()
        chunks = []
        for chunk in r.iter_content(chunk_size=8192):
            if chunk:
                chunks.append(chunk)
        return b"".join(chunks)

def extract_zip_to(buf: bytes, dest: Path):
    with zipfile.ZipFile(io.BytesIO(buf)) as z:
        z.extractall(dest)

def get_resample():
    # Pillow compatibility for LANCZOS constant
    try:
        return Image.Resampling.LANCZOS  # Pillow >= 9.1
    except Exception:
        return Image.LANCZOS

def square_preview(src: Path, dst: Path, size=256):
    try:
        with Image.open(src) as im:
            im = im.convert("RGBA")
            # fit into square, keep aspect
            ratio = min(size / im.width, size / im.height)
            new_w = max(1, int(im.width * ratio))
            new_h = max(1, int(im.height * ratio))
            resample = get_resample()
            im_resized = im.resize((new_w, new_h), resample)
            canvas = Image.new("RGBA", (size, size), (0,0,0,0))
            canvas.paste(im_resized, ((size - new_w)//2, (size - new_h)//2))
            canvas.save(dst)
    except Exception as e:
        print("Preview failed for:", src, e)

def copy_if_image(fp: Path, category_dir: Path, base_name: str, previews_dir: Path, rows: list):
    if fp.suffix.lower() in IMG_EXT:
        out_name = f"{base_name}{fp.suffix.lower()}"
        out_path = category_dir / out_name
        try:
            shutil.copy2(fp, out_path)
            # preview
            prev_name = f"{base_name}_preview.png"
            square_preview(out_path, previews_dir / prev_name, 256)
            rows.append((category_dir.name, base_name, f"{category_dir.name}/{out_name}", "true"))
        except Exception as e:
            print("Copy failed:", fp, e)

def main():
    root = Path.cwd() / "dnd-2d-assets"
    previews = root / "previews"
    ensure_dir(previews)
    for c in ALLOWED_CATS:
        ensure_dir(root / c)

    manifest_path = Path.cwd() / "manifest_2d_assets.json"
    if not manifest_path.exists():
        print("manifest_2d_assets.json not found. Place it next to where you run the script.")
        sys.exit(1)

    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    items = data.get("items", [])
    rows = []

    for it in items:
        name = it.get("name","")
        category = it.get("category","").strip().lower()
        url = it.get("url","").strip()
        typ = it.get("type","").strip().lower()

        if category not in ALLOWED_CATS:
            print(f"Skip '{name}': invalid category '{category}'")
            continue
        if not url:
            print(f"Skip '{name}': empty url")
            continue

        base = slugify(name)
        category_dir = root / category
        ensure_dir(category_dir)

        print(f"Processing: {name} [{category}]")
        try:
            buf = download_file(url)
        except Exception as e:
            print("Download failed:", url, e)
            continue

        # handle by type
        if typ == "zip" or (typ == "" and url.lower().endswith(".zip")):
            temp_dir = root / f"_tmp_{base}"
            ensure_dir(temp_dir)
            try:
                extract_zip_to(buf, temp_dir)
                # scan for images in the zip (png/jpg/webp)
                count = 0
                for p in temp_dir.rglob("*"):
                    if p.is_file() and p.suffix.lower() in IMG_EXT:
                        count += 1
                        copy_if_image(p, category_dir, f"{base}_{count:03d}", previews, rows)
                if count == 0:
                    print("No images found in zip:", name)
            except Exception as e:
                print("Extract failed:", name, e)
            finally:
                shutil.rmtree(temp_dir, ignore_errors=True)

        elif typ == "image" or any(url.lower().endswith(ext) for ext in IMG_EXT):
            # save single file
            ext = Path(url).suffix.lower()
            out_name = f"{base}{ext}"
            out_path = category_dir / out_name
            try:
                with open(out_path, "wb") as f:
                    f.write(buf)
                square_preview(out_path, previews / f"{base}_preview.png", 256)
                rows.append((category, base, f"{category}/{out_name}", "true"))
            except Exception as e:
                print("Write failed:", name, e)
        else:
            print("Unknown type, skipping:", name, url)

    # write CSV
    csv_path = root / "assets.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["category","name","storage_path","approved"])
        for r in rows:
            w.writerow(r)

    # zip result
    zip_path = root.with_suffix(".zip")
    print("Zipping to:", zip_path.name)
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for p in root.rglob("*"):
            if p.is_file():
                z.write(p, p.relative_to(root.parent))

    print("✅ Done. Files created:")
    print(" -", csv_path)
    print(" -", zip_path)

if __name__ == "__main__":
    main()
