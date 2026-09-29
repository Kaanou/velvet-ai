from pathlib import Path

# GitHub Pages build step.
# Runtime AI wiring lives in ai.js; do not monkey-patch window.send during deploy.
# This file only ensures the PWA manifest exists and never injects legacy IA code.

manifest = Path("manifest.webmanifest")
manifest.write_text(
    '{"name":"Velvet AI","short_name":"Velvet AI","start_url":"./","display":"standalone",'
    '"background_color":"#080808","theme_color":"#080808","lang":"fr","icons":[]}',
    encoding="utf-8",
)

index = Path("index.html")
s = index.read_text(encoding="utf-8")
if '<link rel="manifest"' not in s:
    index.write_text(
        s.replace("</head>", '<link rel="manifest" href="manifest.webmanifest"></head>'),
        encoding="utf-8",
    )
