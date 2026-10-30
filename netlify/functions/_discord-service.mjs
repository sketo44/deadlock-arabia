import {randomBytes,createHash} from 'node:crypto';
import {db} from './_shared/store.mjs';
import {queueDraft,queueMessage} from './_discord-queue.mjs';
import {discordResultPng} from './_discord-image.mjs';
export const DISCORD_APP_ID='1563676999933894797';
export const DISCORD_PUBLIC_KEY='ad6164a32463fd5f4ddad459bebdc3cfced99ca9107d4503b5b6394327cda248';
export const hashDiscord=value=>createHash('sha256').update(value).digest('hex');
export const discordConfigured=()=>!!(process.env.DISCORD_BOT_TOKEN&&/^\d{17,22}$/.test(process.env.DISCORD_GUILD_ID||'')&&/^\d{17,22}$/.test(process.env.DISCORD_CHANNEL_ID||''));
const base='https://discord.com/api/v10';
export async function discordRequest(path,body,method='POST'){
 const multipart=body instanceof FormData;const r=await fetch(base+path,{method,headers:{Authorization:'Bot '+process.env.DISCORD_BOT_TOKEN,...(!multipart?{'Content-Type':'application/json'}:{})},...(body?{body:multipart?body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(18000)});
 if(!r.ok)throw Error(r.status===429?'دسكورد طلب الانتظار؛ حاول بعد قليل':'تعذّر إرسال رسالة دسكورد ('+r.status+')');return r.status===204?null:r.json();
}
export async function discordReply(interaction,content,components=[]){return discordRequest('/webhooks/'+DISCORD_APP_ID+'/'+interaction.token+'/messages/@original',{content,components,allowed_mentions:{parse:[]}},'PATCH')}
export async function discordQueueRow(id){return(await db('discord_queues?id=eq.'+id+'&select=*'))[0]}
export async function updateQueueMessage(id){for(let i=0;i<2;i++){const row=await discordQueueRow(id);if(!row?.message_id)return;await discordRequest('/channels/'+row.channel_id+'/messages/'+row.message_id,queueMessage(row.state),'PATCH');const latest=await discordQueueRow(id);if(latest.version===row.version)return}}
export async function startQueueDraft(id){let row=await discordQueueRow(id);if(!row||row.draft_code||!row.state.teams||row.state.status!=='ready')return;
 const code=randomBytes(4).toString('hex').toUpperCase(),state=queueDraft(row.state),q={...row.state,draftCode:code,status:'draft'};
 await db('rpc/discord_start_draft',{method:'POST',body:JSON.stringify({p_id:id,p_version:row.version,p_code:code,p_state:state,p_queue:q})});
}
export async function discordLinkButton(user){const token=randomBytes(24).toString('hex');await db('discord_link_tokens',{method:'POST',body:JSON.stringify({hash:hashDiscord(token),discord_id:user.id,display_name:String(user.global_name||user.username||'لاعب').slice(0,64),expires_at:new Date(Date.now()+600000).toISOString()})});return[{type:1,components:[{type:2,style:5,label:'ربط حساب Steam',url:'https://www.deadlockar.com/?discord_link='+token+'#account'}]}]}
export async function sendDiscordOutbox(id){const job=(await db('discord_outbox?id=eq.'+id+'&select=*'))[0];if(!job||!await db('rpc/discord_claim_outbox',{method:'POST',body:JSON.stringify({p_id:id})}))return;
 try{const q=await discordQueueRow(job.queue_id);if(!q?.draft_code)throw Error('Missing draft');let payload,form;
 if(job.kind==='draft'){payload={content:q.state.players.map(p=>'<@'+p.discordId+'>').join(' ')+'\nاكتمل العدد! ادخلوا الدرافت. الكابتن هو أول لاعب بكل فريق.',allowed_mentions:{parse:[],users:q.state.players.map(p=>p.discordId)},components:[{type:1,components:[{type:2,style:5,label:'افتح الدرافت',url:'https://www.deadlockar.com/draft/#room/'+q.draft_code}]}]};}
 else{const draft=(await db('draft_lobbies?code=eq.'+q.draft_code+'&select=code,state,version'))[0];if(draft?.state.studio){const {notifyStudioResult}=await import('./_studio-discord.mjs');await notifyStudioResult(q.draft_code);await db('discord_outbox?id=eq.'+id,{method:'PATCH',body:JSON.stringify({status:'sent'})});return}if(draft?.state.status!=='completed')throw Error('Draft incomplete');const png=await discordResultPng(draft.state);payload={allowed_mentions:{parse:[]},attachments:[{id:0,filename:'draft-result.png'}]};form=new FormData();form.append('files[0]',new Blob([png],{type:'image/png'}),'draft-result.png');}
 payload.nonce=q.id+(job.kind==='draft'?'d':'r');payload.enforce_nonce=true;if(form)form.append('payload_json',JSON.stringify(payload));
 const sent=await discordRequest('/channels/'+(job.kind==='result'?(process.env.DISCORD_RESULTS_CHANNEL_ID||q.channel_id):q.channel_id)+'/messages',form||payload);
 await db('discord_outbox?id=eq.'+id,{method:'PATCH',body:JSON.stringify({status:'sent'})});if(job.kind==='result')await db('discord_queues?id=eq.'+q.id,{method:'PATCH',body:JSON.stringify({result_message_id:sent.id})});
 }catch{await db('discord_outbox?id=eq.'+id,{method:'PATCH',body:JSON.stringify({status:'pending'})})}
}
export async function notifyDiscordDraft(code){if(!discordConfigured())return;const q=(await db('discord_queues?result_message_id=is.null&draft_code=eq.'+code+'&select=id'))[0];if(!q)return;const draft=(await db('draft_lobbies?code=eq.'+code+'&select=state'))[0];if(draft?.state.studio){const {notifyStudioResult}=await import('./_studio-discord.mjs');return notifyStudioResult(code)}if(draft?.state.status!=='completed')return;
 await db('discord_outbox',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({id:q.id+':result',queue_id:q.id,kind:'result'})});await sendDiscordOutbox(q.id+':result');
}
export async function sweepDiscordJobs(){if(!discordConfigured())return;await db('discord_link_tokens?expires_at=lt.'+encodeURIComponent(new Date().toISOString()),{method:'DELETE'});const pending=await db('discord_outbox?status=neq.sent&attempts=lt.5&select=id&limit=10');for(const job of pending)await sendDiscordOutbox(job.id);const queues=await db('discord_queues?draft_code=not.is.null&result_message_id=is.null&select=id,draft_code&order=created_at.desc&limit=10');for(const q of queues)await notifyDiscordDraft(q.draft_code);const website=await db('draft_lobbies?state->>status=eq.complete&select=code&order=updated_at.desc&limit=20');for(const row of website){const {notifyStudioResult}=await import('./_studio-discord.mjs');await notifyStudioResult(row.code)}}
export function discordBackground(task){if(globalThis.EdgeRuntime?.waitUntil)globalThis.EdgeRuntime.waitUntil(task);else void task.catch(()=>{})}
