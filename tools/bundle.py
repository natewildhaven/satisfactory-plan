#!/usr/bin/env python3
"""Inline the stylesheet and scripts into one self-contained page.

Usage: python3 tools/bundle.py out.html [--fragment]

--fragment drops the <!doctype>/<html>/<head>/<body> wrapper, for hosts that
add their own (such as a claude.ai Artifact).
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()


def main(out, fragment):
    html = read("index.html")
    html = re.sub(
        r'<link rel="stylesheet" href="styles.css">',
        lambda _: "<style>\n" + read("styles.css") + "</style>",
        html,
    )
    html = re.sub(
        r'<script src="(js/[^"]+)"></script>',
        lambda m: "<script>\n" + read(m.group(1)).replace("</script", "<\\/script") + "</script>",
        html,
    )
    if fragment:
        head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
        body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
        head = re.sub(r'\s*<meta (charset|name="viewport")[^>]*>', "", head)
        head = head.replace("<title>", '<meta name="claude:viewport-fit-sides" content="cover">\n  <title>', 1)
        # The title must be near the top, so put it ahead of the large inline <style>.
        html = head.strip() + "\n" + body.strip() + "\n"
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)


if __name__ == "__main__":
    main(sys.argv[1], "--fragment" in sys.argv[2:])
