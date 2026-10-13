# Wayfinder

Wayfinder is the home page for the Wayfinder study guides. It links to each volume.

| Volume | Path | Repository today |
| --- | --- | --- |
| Bible | `/bible/` | `foxhollowgames/bible-wayfinder` |
| Book of Mormon | `/book-of-mormon/` | `foxhollowgames/book-of-mormon-wayfinder` |
| Doctrine and Covenants | `/doctrine-and-covenants/` | `foxhollowgames/dc-wayfinder` |

## How the one domain works

This repository is the GitHub Pages user site (`foxhollowgames.github.io`). Its custom domain is `wayfinder.josephnewelldesign.com`. GitHub serves each volume repository as a folder of that domain when the volume has no custom domain of its own. The folder name is the repository name. Each volume deploys from its own repository.

## Run it

Node.js is required. Nothing needs installing.

- Run `npm start` in this folder and open <http://127.0.0.1:4170>.
- The server reads each volume from a sibling folder: `Bible Wayfinder`, `Book of Mormon Wayfinder`, and `D&C Wayfinder`. Set `BIBLE_DIST`, `BOM_DIST`, or `DC_DIST` to use a different `dist` folder.

## Edit

- `dist/index.html` holds the volume cards.
- `dist/hub.css` holds the hub styles. `dist/bible.css` is a copy of the shared reader stylesheet.
- Each card uses an image from its volume. The paths are in `dist/hub.css`.
