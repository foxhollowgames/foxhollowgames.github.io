# Wayfinder

Wayfinder is the home page for the Wayfinder study guides. It links to each volume.

| Volume | Path | Repository |
| --- | --- | --- |
| Bible | `/bible/` | `foxhollowgames/bible` |
| Book of Mormon | `/book-of-mormon/` | `foxhollowgames/book-of-mormon` |
| Doctrine and Covenants | `/doctrine-and-covenants/` | `foxhollowgames/doctrine-and-covenants` |
| Timeline | `/timeline/` | `foxhollowgames/timeline` |

## How the one domain works

This repository is the GitHub Pages user site (`foxhollowgames.github.io`). Its custom domain is `wayfinder.josephnewelldesign.com`. GitHub serves each volume repository as a folder of that domain when the volume has no custom domain of its own. The folder name is the repository name. Each volume deploys from its own repository.

## Run it

Node.js is required. Nothing needs installing.

- Run `npm start` in this folder and open <http://127.0.0.1:4170>.
- The server reads each volume from a sibling folder: `Bible Wayfinder`, `Book of Mormon Wayfinder`, and `D&C Wayfinder`. The timeline comes from `timeline/dist`. Set `BIBLE_DIST`, `BOM_DIST`, `DC_DIST`, or `TIMELINE_DIST` to use a different `dist` folder.

## Edit

- `dist/index.html` holds the volume cards.
- `dist/hub.css` holds the hub styles. `dist/bible.css` is a copy of the shared reader stylesheet.
- The image paths are in `dist/hub.css`. The Bible card uses `dist/assets/bloch-sermon-on-the-mount.jpg` (Carl Bloch, 1877, public domain, from Wikimedia Commons). The Book of Mormon card links to the cover image on churchofjesuschrist.org. The Doctrine and Covenants card uses a portrait from its volume. The Timeline card uses `timeline/assets/hub-card.jpg`, cropped from NASA's Blue Marble.

## Shared viewer

The Bible and the Doctrine and Covenants use one reader. Its source is in `viewer/`. The Book of Mormon uses the shared shell files (`breadcrumbs`, `chapter-picker`, `modal-drag`, `settings-menu`) with its own `app.js` and `styles.css`.

1. Edit the files in `viewer/`.
2. Change `releaseVersion` in `viewer/app.js` to a new value. Each page loads the shared files with this version.
3. Run `npm run sync-viewer`. The script copies the files into each volume's `dist/` folder and updates the `?v=` values in its pages.
4. Run the checks in each volume, then commit and push each volume.

Run `npm run sync-viewer -- --check` to find copies that are out of date. The script stops if someone edited a copy in a volume. Move that edit into `viewer/` first.

Each chapter on the timeline's list gets a "See on timeline" link. The reader fetches `../timeline/data/chapters.json` to find them.

A book changes the reader through its data, not through code. For example, `timeline.milestones: false` turns off dated milestones, and `map.fadeMinorRivers: true` draws small rivers thin.

## Old addresses

Three small repositories hold the old addresses and send each link to its new place: `isaiah-redirect`, `dandc-redirect`, and `bookofmormon-redirect`.
