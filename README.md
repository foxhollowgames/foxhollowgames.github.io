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

## Optional visit analytics

`viewer/analytics.js` is the source for optional Google Analytics (GA4), measurement ID `G-DB54M9BCZM`.
Google's script loads only after the visitor selects **Accept analytics**. **Analytics choices** reopens the controls.
Declining or withdrawing prevents future collection and removes this implementation's first-party GA cookies.
Withdrawal reloads an already-tracked page to unload the Google library. It does not delete historical data at Google.
The choice lasts 180 days in local storage; GA cookies expire after 60 days without renewal.

Only page loads are instrumented, grouped into the hub, Bible, Book of Mormon, Doctrine and Covenants, and Timeline.
No chapter state, search terms, URL query/fragment, document title, or referrer address is intentionally sent.
GA still creates standard session, first-visit, and engagement metadata. Counts exclude non-consenting visitors and blocked scripts.
Keep Enhanced Measurement, Google signals, user-provided data, advertising personalization, and granular device/location collection OFF in GA.
Keep event/user retention at two months with reset on new activity OFF. This code does not configure the GA admin settings.

After editing the source, run `npm run sync-analytics`, then the Bible `python scripts/build-share.py` and D&C `python3 scripts/build.py` generators. Run `npm run check:analytics` and `npm run sync-analytics -- --check` in the hub.
Set `BIBLE_DIST`, `BOM_DIST`, `DC_DIST`, and `TIMELINE_DIST` for alternate checkout locations.
Run the existing checks in each volume before publishing. Keep the analytics loader in HTML generators and templates.
The sync script deliberately skips redirect pages. Publish all changed repositories through their existing Pages workflows.

For a labeled production check, open `https://wayfinder.josephnewelldesign.com/?analytics_debug=1`, then accept analytics.
This sets `debug_mode: true` and `traffic_type: verification`; inspect GA DebugView for `page_view`.
The flag is not sent as part of the URL, and does not bypass consent. Remove it after testing.
Normal automated browsers and all non-production hosts (including localhost) never load GA.
Verification allows an automated browser only with the explicit debug flag on a production host.
Debug traffic is labeled, not automatically excluded from aggregate reports. Use a GA developer/internal traffic filter if needed.

Official implementation references:
- https://developers.google.com/analytics/devguides/collection/ga4/views
- https://developers.google.com/analytics/devguides/collection/ga4/reference/config
- https://developers.google.com/tag-platform/security/guides/privacy

The source's collectionMode can pause all collection or allow only explicit verification URLs during deployment checks.
Global privacy parameters are queued with gtag('set') before initialization; explicit page_view parameters duplicate the sanitized fields.
The upgraded Google tag container must also disable its automatic detection and user-data capabilities and set send_page_view=false.
Do not assume on-page gtag('config') overrides the upgraded container. Verify actual received values before enabling collection.
