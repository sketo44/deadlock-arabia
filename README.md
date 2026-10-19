# Deadlock AR

Arabic community website for Deadlock. Includes character profiles, lore, 3D models, item/build planning, community rankings, rooms and tournaments.

## Current status

The latest character designs are local work. This repository is a source backup; pushing it does not deploy the site. Hosting and a custom domain will be configured separately.

Customized profiles: Seven, Vindicta, Wraith, Dynamo, Drifter, Billy and Solomon. Community ranking demo data is available only on localhost with `?ranking-demo=1`; it is never stored as real community data.

## Local development

Node.js 22 or later:

```sh
npm start
npm test
```

Static preview does not run the server functions. Live community data, Steam authentication, room actions and tournaments require the backend configuration.

## Secrets

Configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_SITE_URL` and `STEAM_SESSION_SECRET` only in the hosting provider's server environment. `COMMUNITY_ADMIN_STEAM_IDS` is optional and must only contain explicitly appointed admins. Never commit credentials, Steam passwords, Steam session tokens or server secrets.

`config.js` contains browser-public Supabase configuration. Its anon key is not a server/service-role key. Database row-level security and server-side authorization remain required.

The repository excludes personal player preview snapshots. It does not contain the separate Steam GC experiment or deployment credentials from the surrounding workspace.

## Content ownership

Deadlock characters, original game artwork and models belong to Valve. This is an independent community project. Wiki-derived lore includes attribution and CC BY-SA 4.0 links in the relevant profile sections. AI-generated character backgrounds are project assets and are not official Valve artwork. See the existing setup documents and SQL migrations for backend details.
