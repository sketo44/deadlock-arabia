# Verification — 2026-10-16

Passed Node.js automated tests (6): Arabic/emoji share roundtrip; real item totals and removal; invalid/duplicate/oversized builds; unlock and 1/2/5 ability costs; malformed links/unsafe URLs; hero-to-ability references, Arabic description availability, and local image existence.

Passed headless Microsoft Edge browser checks at 1440×1000 and 390×844: all seven main routes, hero profiles and four abilities, item details dialog, search and no-results state, item addition/removal, draft persistence after reload, save and shared-link import, ability ordering, malformed share link handling, unconfigured account/community notices, API failure fallback, and no horizontal overflow across the main routes. No uncaught browser exceptions. Desktop and mobile screenshots supplied separately and visually inspected.

Supabase authentication, owner-authenticated publishing, community retrieval/import, deletion, logout, and escaping user-supplied HTML are covered by an intercepted browser REST simulation. This proves the frontend contract only. No live Supabase project, real email delivery, SQL execution, production Netlify deployment, or real-user moderation has been tested. Credentials were not supplied.

Data snapshot is real API data retrieved for this delivery. API availability, future schema changes, authored Arabic review, and mail-provider delivery remain external dependencies. Full data refresh tool is supplied and syntax checked; the original snapshot preparation flow was executed. The packaged refresh command was not rerun end-to-end because no live data refresh was required for the local UI iteration.


## Local shop iteration

Passed 10 Node tests, including coverage of all 156 item explanations, all hero ability explanations, a glossary for every visible shop stat, and rejection of outdated Arabic when the English source changes. No translation service is present in the updater.

Passed Edge desktop/mobile checks: 156 items, three categories, four ascending tiers each, English name ordering within tiers, authored Arabic details, category tabs, Arabic semantic search, no-results state, preview tooltip, persistent shop DOM and stable scroll on adding items, draft/save/share/progression regressions, and no horizontal overflow on all seven main mobile routes. Mock Supabase login/publish/import/delete/logout remains passing. No Netlify deployment or ZIP replacement was performed in this local iteration.


## Artwork, portrait picker and leaderboards

13 Node tests pass. Edge desktop and mobile checks pass for the optimized generated artwork, 41 hero portraits, picker search/selection, preserved build title and reset ability order, live Europe leaderboard with source confirmation, name filtering, mocked player ID conversion/rank/totals scoped to the requested account, Asia API failure falling back to its dated real snapshot, and eight main mobile routes without horizontal overflow. The five region snapshots and rank images were downloaded from the real API. Player-stat and rank endpoints were additionally probed with a public account ID; test totals in the browser were separately mocked. No production deployment was performed.


## Ability upgrade explanations

Every shipped ability upgrade field now has authored Arabic terminology. Upgrade metadata is preserved separately from visible nonzero base stats so health, lifesteal, resistance and unlock flags no longer display raw internal identifiers. Cooldown reductions, time/distance/percent units, additive stat scaling, scaling multipliers and conditional unlocks use distinct rendering. The same upgrade renderer is available in hero pages and detail dialogs.
