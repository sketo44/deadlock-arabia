# Community arena — 2026-10-18

Published to the existing Netlify site. Entry: /#tournaments. No administrator assigned, per user choice.

- Fixed 12-player 6v6 rooms, leader counted. All Steam-verified users may create; no community ranking opt-in required.
- Names max 60 characters; current map allowlist contains only The Cursed Apple (cursed-apple).
- Room becomes permanently full on player 12; clock starts then and runs 90 minutes. Leaving does not reopen it. Leader can close early.
- Expiry is effective at expires_at. SQL enforces it on every room read/mutation; UI clock and 30-second visible-page refresh reflect it. No paid scheduled job.
- Room row lock enforces capacity, per-account advisory lock prevents joining multiple active rooms. Limit three room creations per leader per hour.
- Private RLS tables game_rooms/game_room_players, service-role-only room_action RPC. Browser responses omit Steam IDs. Mutations require same-origin requests and verified HttpOnly Steam session.
- Tournament stream_url allows exact HTTPS Twitch channels or TikTok @name/live URLs. Twitch iframe uses current hostname parent; TikTok opens externally because official embeds cover posts, not LIVE.
- Existing tournament admin editor supports selecting an existing tournament and updating its stream. Admin assignment remains deferred.
- Rooms organize people on the site; they do not create in-game lobbies or assign in-game teams automatically.

Validation: all 39 automated tests passed; desktop 1440/mobile 390 interaction checks; production anonymous mutation denial and private table access denial; actual SQL transaction test of 12-player lock, no reopen, leader-only close, and expiry rolled back all test data. Two real authenticated UI test rooms were created and closed. Verified final room disappears without reload and create dialog works after switching tabs.

Deployment: 6ad47230958caed2c863f718. Server functions: five. No private keys in public deployment scan. No test rooms remain active.
