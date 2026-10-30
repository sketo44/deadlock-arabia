import {Buffer} from 'node:buffer';
import gateway from './edge-gateway.mjs';
globalThis.Buffer=Buffer;
globalThis.DEADLOCK_ENV={...Deno.env.toObject(),PUBLIC_SITE_URL:'https://www.deadlockar.com',STEAM_CALLBACK_URL:Deno.env.get('SUPABASE_URL')+'/functions/v1/deadlock-community?fn=arab-community&op=callback'};
Deno.serve(gateway);
