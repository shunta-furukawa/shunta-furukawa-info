# Repository Guidelines

## Project Structure

This repository is a Hugo-based personal portfolio site for `shunta-furukawa.info`, deployed via GitHub Pages.

- `hugo.toml`: site configuration (baseURL, language, theme selection).
- `themes/shunta-furukawa-info/`: custom theme (layouts, assets, static files).
  - `layouts/`: Hugo templates (e.g., `layouts/_default/baseof.html`, `layouts/index.html`).
  - `assets/`: source CSS/JS (e.g., `assets/css/*.css`, `assets/js/main.js`).
  - `static/`: images/fonts served as-is.
- `data/`: YAML-driven content used by templates.
  - `data/skills/_N_<category>.yaml`: skill categories (prefix `_1_`, `_2_` controls display order).
  - `data/stories/_YYYYMM.yaml`: timeline entries (file name controls sorting).
- `archetypes/default.md`: front matter template for new content.
- `public/`: deployment output (Git submodule for GitHub Pages). Avoid editing by hand.

## Build, Test, and Development Commands

Prerequisites: Hugo (extended recommended) and Git.

- `git clone --recurse-submodules <repo>`: clone including the `public/` submodule.
- `git submodule update --init --recursive`: (re)initialize submodules.
- `hugo server -D`: run locally at `http://localhost:1313` (use `-D` to preview drafts).
- `hugo new posts/<name>.md`: create a new post from `archetypes/default.md`.
- `hugo`: build the site into `public/`.

## Coding Style & Naming Conventions

- Prefer the existing formatting in each file type (HTML templates: 2-space indent; CSS/YAML: match surrounding style).
- Keep YAML keys stable and ordered (`category`, `color`, `items`), and use UTF-8 (Japanese text is common).
- Name new skill files with an order prefix: `data/skills/_7_<topic>.yaml`. Name stories as `_YYYYMM.yaml`.

## Testing Guidelines

No automated test suite is configured. Validate changes by:

- Running `hugo server -D` and checking key pages (top, posts, story).
- Running `hugo` to ensure the build completes without errors.

## Commit & Pull Request Guidelines

- Commits in this repo are typically short, descriptive messages (often Japanese). Keep one logical change per commit.
- For PRs: describe the user-visible change, include screenshots for layout/style updates, and note any deployment impact.

## Deployment Notes

Deployment updates the `public/` submodule:

1. `hugo`
2. `cd public && git add . && git commit -m "Deploy updates" && git push origin master`
3. Commit/push this repo to `master`.

