# Player profile update — ready, publication blocked

2026-10-18: Netlify API rejected createSiteDeploy with HTTP 403: Account credit usage exceeded - new deploys are blocked until credits are added. No billing or plan changes made. Existing public site remains on deploy 6ad476a19faa241566a1b9d1 (full-page arena background).

Pending implementation in source and staging:
- Read public Steam XML name/avatar without requiring a paid API; verify returned Steam identity and allow only Steam avatar hosts.
- Extended member and hero aggregates: available-match seconds, kills, deaths, assists. Added fields migrated successfully to live DB; additive and compatible with existing production code.
- Self profile via authenticated status endpoint only: Steam name/photo, rank emblem, 8 summary metrics, all available heroes with pictures and per-hero stats.
- Ranking and hero top 10 avatars, selected hero image; explicit refresh/cached messages.
- Room create/join uses public Steam name if community profile missing.

Tests: all 41 tests passed before final room-name enhancement, then 5 focused room/profile tests passed; UI checked 1440/390 without overflow. Real local preview at http://127.0.0.1:4177/player-preview.html shows actual Sketo profile, 375 available games, 234.0 match hours, badge 16 (Initiate 6), 38 heroes. Preview is local, not staged for public deployment.

To publish after credits become available: run existing work/publish-live-api.mjs. Its staging already contains changed frontend files and 5 freshly packaged functions. Then use actual authenticated Steam refresh (profile_version is 0 for old rows, so first refresh bypasses 5-minute cache), confirm real name/avatar and stats, capture screenshot. Do not claim this change was deployed yet.
