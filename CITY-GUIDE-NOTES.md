# Local city guide and hero viewer

Implemented on 18 October 2026. These changes are local and have not been deployed.

- Homepage: six illustrated entry tiles; existing global navigation preserved. Official map street screenshot replaces the previous arena background.
- Character profiles: overview, full story, about, ability/stat and inline 3D panels. Tabs sit below the character roster, support keyboard navigation and change only the lower content. Selecting the 3D tab loads its model automatically in the same profile; the standalone viewer route remains available for direct links.
- Viewer: all 43 selectable characters use unmodified GLB files obtained from the corresponding Deadlock Wiki file pages. Models are loaded only after the visitor opens the viewer. Horizontal dragging and buttons rotate the camera; elevation, pan and zoom are locked. No automatic rotation.
- Beginner guide: six topics and 44 Arabic explanations covering lanes/map, economy, three jungle tiers, objectives, transport and first-match advice. Advice is written for beginners; numerical facts are snapshots, not live patch tracking.

## Sources and attribution

`data/game-guide.json` records the wiki pages, revision IDs and review date for each topic. The interface links to those exact revisions. Arabic factual summaries derived from Deadlock Wiki are attributed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Game artwork and models belong to Valve.

The “عن الشخصية” tab uses the translated wiki introduction/Overview for every character, stored with original paragraphs and revision links in `data/hero-overviews.json` and included as `overviewAr` in `data/hero-lore.json`. This is separate from `storyAr`, which retains the full published Backstory translation. Short original backstories are intentionally kept short; supplemental lore pages are not represented as part of the published Backstory.

`data/hero-models.json` records the original file page, local asset, byte count and character-page revision for every model. `data/guide-asset-sources.json` records image sources. `assets/map-city-street.source.json` records the official map screenshot source.

Viewer dependency: Google `<model-viewer>` 4.4.0, vendored locally, with its Apache-2.0 license in `vendor/model-viewer-LICENSE`. Draco 1.5.7 decoders are bundled locally. There is no paid service or account requirement for this viewer or guide.

## Validation

- Rendered all 43 real GLB models in the browser; checked nonempty dimensions.
- Verified pointer dragging changes horizontal rotation while elevation stays at 80 degrees.
- Checked the six guide routes, four profile tabs and single-open ability details.
- Checked layouts at 390, 768 and 1440 pixels; no page overflow.
- Existing 34 automated checks passed; planner add/remove, skill upgrades, notes, saved builds and sharing passed on desktop/mobile.
- Item shop category layouts checked across nine widths; the collapsed-grid bug stays fixed.

The guide and character narratives need editorial review whenever the game changes. They are not an exhaustive mirror of the wiki, and the model assets do not update automatically.
