# Self-Melt

Canvas2D mini [Meltdown](https://meltd.ooo/wn): the program loads its own source, syntax-highlights it, and melts the character grid with a noise direction field.

**Live demo (after GitHub Pages is on):**  
`https://<your-username>.github.io/self-melt/`

## Run locally

```bash
cd self-melt
python3 -m http.server 5174
# open http://localhost:5174
```

Or: `npm start`

> Must be served over HTTP so `fetch('./main.js')` can load the source. Opening `index.html` via `file://` falls back to a short sample.

## Controls

| Key | Action |
|-----|--------|
| `Space` | Pause / resume |
| `R` | Reset melt |
| `1`–`4` | Palette: MONO / MATRIX / BSOD / EMBER |
| `[` `]` | Slower / faster melt |
| `-` `=` | Smaller / larger cells |
| `,` `.` | Animation speed |
| Arrows / drag | Scroll source |
| `H` | Toggle HUD |

## Deploy on GitHub Pages (free)

1. Create a public repo named `self-melt` and push this folder.
2. **Settings → Pages → Source:** Deploy from branch `main` / folder `/ (root)`.
3. After ~1 minute, open:  
   `https://<username>.github.io/self-melt/`

No build step — pure static HTML/CSS/JS.

## Free “domain” options

| Option | URL shape | Notes |
|--------|-----------|--------|
| **GitHub Pages** (recommended) | `username.github.io/self-melt` | Free forever, HTTPS, zero config |
| **User site** | `username.github.io` | Rename repo to `username.github.io` if you want the root URL |
| **js.org** | `self-melt.js.org` | Free CNAME; [apply via js.org](https://github.com/js-org/js.org) if name is free |
| **Cloudflare Pages** | `self-melt.pages.dev` | Free; connect the same GitHub repo |
| **Vercel / Netlify** | `*.vercel.app` / `*.netlify.app` | Free; drag-and-drop or Git |
| **Custom domain** | your name | Buy ~$10/yr (Namecheap / Cloudflare Registrar), point DNS to Pages |

True second-level free domains (`.tk` etc.) are unreliable — prefer GitHub Pages or a cheap `.dev` / `.com`.

### Optional custom domain on GitHub Pages

1. Buy a domain (or use Cloudflare free subdomain services carefully).
2. Repo **Settings → Pages → Custom domain** → enter e.g. `melt.example.com`.
3. Add DNS records as GitHub shows (usually `CNAME` → `username.github.io`).
4. Enable **Enforce HTTPS**.

## How it maps to Meltdown

| Piece | Role |
|-------|------|
| `loadSource()` | Self-fetch source (code = image) |
| `tokenizeSource()` | Mini lexer |
| `writeSourceIntoGrid()` | Paint tokens into cells |
| `meltTick()` + `warpDir()` | Neighbor copy / melt field |
| `draw()` | Canvas2D `fillText` |

## License

MIT — do what you want; inspired by Andreas Gysin’s *Meltdown*, not a fork of on-chain code.
