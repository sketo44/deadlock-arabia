# Custom Game Discord bot

The bot uses signed HTTP interactions on the existing Supabase Edge Function. It does not need a Gateway connection or a PC running continuously. Only the authorized guild and channel can create or modify queues.

- Application: `1563676999933894797` (`Custom Game`).
- Interactions endpoint: `https://ezrvthodvzywskwqlfsy.supabase.co/functions/v1/deadlock-community?fn=discord-bot`.
- Command: `/custom`, optional `name`.
- Required server permissions: View Channel, Send Messages, Embed Links, Attach Files and Read Message History. Administrator and privileged message-content intents are not needed.
- Secrets in Supabase: `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `DISCORD_CHANNEL_ID`; optionally `DISCORD_RESULTS_CHANNEL_ID`.

Apply `supabase/discord-migration.sql` and `supabase/discord-jobs-migration.sql` using the database administrator. Their functions and tables are restricted to the service role. Call `discord_schedule_jobs` from the server with the purpose-separated HMAC key derived from `STEAM_SESSION_SECRET` using `deadlock-discord-jobs-v1`. The scheduler stores this key in Vault and calls the jobs endpoint once per minute. Refresh its key if the Steam session signing secret changes.

A joining Discord account must confirm a one-use, ten-minute link to a verified Steam session on the account page. Neither account password is collected. Duplicate Discord or Steam accounts cannot fill multiple seats. The twelfth player locks registration. A random shuffle determines the two teams and their captains. The database transaction creates one draft and an outbox job; captains start the draft when ready.

A completed Discord draft queues a PNG result and an in-game custom-lobby code. The PNG is generated in the Edge Function using pinned resvg WASM, local font assets and small PNG portraits; no browser session or user PC is required. The existing lobby creation lock ensures one lobby per draft. Outbox claims serialize delivery, and Discord nonces suppress recent duplicate sends. Failed delivery is retried up to five times by the scheduled worker. The lobby provider's availability and rate limit still apply; no fabricated lobby codes are returned.

Operator endpoints `op=setup`, `op=discover` and `op=jobs` require `x-discord-job-secret`. They are not browser administration routes. The setup endpoint verifies server/channel configuration and registers the guild command. Never put the bot token or job key in frontend files or command-line arguments.

Licenses: resvg JS/WASM is MPL-2.0 (source at https://github.com/yisibl/resvg-js, package `@resvg/resvg-wasm` 2.6.2). Noto fonts use OFL. License files are under `assets/discord/`. Hero portraits remain Valve assets.
