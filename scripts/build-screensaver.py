#!/usr/bin/env python3
"""Build offline single-file screensaver.html from index assets."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    css = (ROOT / "style.css").read_text()
    js = (ROOT / "main.js").read_text()
    js_json = json.dumps(js)
    js_safe = js.replace("</script>", "<\\/script>")
    css_safe = css.replace("</style>", "<\\/style>")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Self-Melt Screensaver</title>
<style>
{css_safe}
html, body {{ cursor: none; }}
#hud {{ display: none !important; }}
</style>
</head>
<body>
<canvas id="c"></canvas>
<aside id="hud" class="hidden" aria-hidden="true"></aside>
<script>
window.SELF_MELT_SOURCE = {js_json};
window.SELF_MELT_SCREENSAVER = true;
</script>
<script type="module">
{js_safe}
</script>
</body>
</html>
"""
    out = ROOT / "screensaver.html"
    out.write_text(html)
    print(f"wrote {out} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
