import {timingSafeEqual,createHmac} from 'node:crypto';
import {db,json} from './_shared/store.mjs';
import {verify,readCookie,sameOrigin} from './_shared/steam.mjs';
import {validDiscordSignature} from './_discord-signature.mjs';
import {newDiscordQueue,changeDiscordQueue,queueMessage} from './_discord-queue.mjs';
import {blockedTerms,normalizeContent} from '../../build-moderation.js';
import {DISCORD_APP_ID,DISCORD_PUBLIC_KEY,hashDiscord,discordConfigured,discordRequest,discordReply,discordQueueRow,updateQueueMessage,startQueueDraft,discordLinkButton,sendDiscordOutbox,sweepDiscordJobs,discordBackground} from './_discord-service.mjs';
const tokenOK=t=>/^[a-f0-9]{48}$/.test(t||'');
async function processInteraction(i){
 if(!await db('rpc/discord_claim_interaction',{method:'POST',body:JSON.stringify({p_id:i.id})}))return;
 try{if(!discordConfigured())throw Error('إعداد البوت ما اكتمل بعد');const user=i.member?.user;
 if(i.guild_id!==process.env.DISCORD_GUILD_ID||i.channel_id!==process.env.DISCORD_CHANNEL_ID||!user||user.bot)throw Error('استخدم البوت في روم الكوستم المحدد داخل السيرفر');
 const actor={discordId:user.id,name:i.member.nick||user.global_name||user.username,manageGuild:!!(BigInt(i.member.permissions||'0')&40n)};
 if(i.type===2){if(i.data?.name!=='custom')throw Error('أمر غير معروف');const recent=await db('discord_queues?guild_id=eq.'+i.guild_id+'&created_at=gt.'+encodeURIComponent(new Date(Date.now()-3600000).toISOString())+'&select=id&limit=10');if(recent.length>=10)throw Error('وصلنا حد فتح الأقيام لهذه الساعة؛ جرّب لاحقًا');
 const title=i.data.options?.find(o=>o.name==='name')?.value||'كوستم المجتمع';if(typeof title!=='string'||blockedTerms.some(w=>normalizeContent(title).includes(normalizeContent(w))))throw Error('اختر اسمًا مناسبًا للقيم');
 const q=newDiscordQueue({id:i.id,guildId:i.guild_id,channelId:i.channel_id,creatorId:user.id,title,mode:'random'});
 await db('discord_queues',{method:'POST',body:JSON.stringify({id:q.id,guild_id:q.guildId,channel_id:q.channelId,creator_id:q.creatorId,state:q})});const message=await discordRequest('/channels/'+q.channelId+'/messages',{...queueMessage(q),nonce:i.id,enforce_nonce:true});await db('discord_queues?id=eq.'+q.id,{method:'PATCH',body:JSON.stringify({message_id:message.id})});await discordReply(i,'تم فتح القيم. اضغط انضمام في رسالة التسجيل.');return;
 }
 const match=/^dla:(join|leave|cancel):(\d{17,22})$/.exec(i.data?.custom_id||'');if(!match)throw Error('زر غير معروف');const[,op,id]=match;
 if(op==='join'){const linked=(await db('discord_accounts?discord_id=eq.'+user.id+'&select=steam_id'))[0];if(!linked){await discordReply(i,'اربط حساب Steam مرة واحدة، ثم ارجع واضغط انضمام.',await discordLinkButton(user));return}actor.steamId=linked.steam_id;}
 let changed=false;for(let attempt=0;attempt<5;attempt++){const row=await discordQueueRow(id);if(!row||row.guild_id!==i.guild_id||row.channel_id!==i.channel_id||row.message_id!==i.message?.id)throw Error('رسالة القيم غير صالحة');const q=changeDiscordQueue(row.state,actor,op);if(await db('rpc/discord_update_queue',{method:'POST',body:JSON.stringify({p_id:id,p_version:row.version,p_state:q})})){changed=true;break}}
 if(!changed)throw Error('التسجيل مزدحم؛ اضغط الزر مرة ثانية');await startQueueDraft(id);await updateQueueMessage(id);await sendDiscordOutbox(id+':draft');await discordReply(i,op==='join'?'تم انضمامك للقيم.':op==='leave'?'تم انسحابك من القيم.':'تم إلغاء القيم.');
 }catch(e){await discordReply(i,e.message==='Storage request failed'?'تعذّر حفظ التسجيل؛ جرّب مرة ثانية.':e.message).catch(()=>{})}
}
export default async function discordHandler(request){const u=new URL(request.url),op=u.searchParams.get('op');
 if(op==='jobs'||op==='setup'||op==='discover'){
 const supplied=request.headers.get('x-discord-job-secret')||'',wanted=process.env.STEAM_SESSION_SECRET?.length>=32?createHmac('sha256',process.env.STEAM_SESSION_SECRET).update('deadlock-discord-jobs-v1').digest('hex'):'';if(request.method!=='POST'||wanted.length<32||supplied.length!==wanted.length||!timingSafeEqual(Buffer.from(supplied),Buffer.from(wanted)))return json({error:'غير مصرح'},401);if(op==='discover'){if(!process.env.DISCORD_BOT_TOKEN)return json({error:'احفظ توكن البوت أولًا'},503);try{const bot=await discordRequest('/users/@me',null,'GET');if(bot.id!==DISCORD_APP_ID)throw Error('التوكن لا يخص Custom Game');const guilds=await discordRequest('/users/@me/guilds',null,'GET');const found=[];for(const g of guilds.slice(0,20)){const channels=await discordRequest('/guilds/'+g.id+'/channels',null,'GET');found.push({id:g.id,name:g.name,channels:channels.filter(c=>[0,5].includes(c.type)).map(c=>({id:c.id,name:c.name}))})}return json({bot:bot.username,guilds:found})}catch(e){return json({error:e.message},400)}}if(op==='setup'){if(!discordConfigured())return json({error:'احفظ توكن البوت وآيديات السيرفر والروم أولًا'},503);try{const guild=await discordRequest('/guilds/'+process.env.DISCORD_GUILD_ID,null,'GET'),channel=await discordRequest('/channels/'+process.env.DISCORD_CHANNEL_ID,null,'GET');if(channel.guild_id!==process.env.DISCORD_GUILD_ID)throw Error('الروم ليس داخل السيرفر المحدد');await discordRequest('/applications/'+DISCORD_APP_ID+'/guilds/'+process.env.DISCORD_GUILD_ID+'/commands',[{name:'custom',description:'افتح قيم كوستم من 12 لاعبًا ثم درافت تلقائي',options:[{name:'name',description:'اسم القيم',type:3,max_length:80,required:false}]}],'PUT');return json({ok:true,guild:guild.name,channel:channel.name})}catch(e){return json({error:e.message},400)}}discordBackground(sweepDiscordJobs());return json({ok:true});
 }
 if(op==='link-preview'||op==='link'){
 try{let token=u.searchParams.get('token');if(op==='link'){if(request.method!=='POST'||!sameOrigin(request))return json({error:'طلب غير مسموح'},403);const body=await request.json();token=body.token;}else if(request.method!=='GET')return json({error:'طلب غير مسموح'},405);
 if(!tokenOK(token))throw Error('رابط الربط غير صالح');const link=(await db('discord_link_tokens?hash=eq.'+hashDiscord(token)+'&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&select=display_name'))[0];if(!link)throw Error('انتهى رابط الربط. ارجع لدسكورد واضغط انضمام للحصول على رابط جديد.');
 if(op==='link-preview')return json({displayName:link.display_name});const user=verify(readCookie(request,'steam'),'steam');if(!user)return json({error:'ادخل بحساب Steam أولًا'},401);
 const result=await db('rpc/discord_consume_link',{method:'POST',body:JSON.stringify({p_hash:hashDiscord(token),p_steam:user.steamId})});return json({ok:true,displayName:result.displayName});
 }catch(e){return json({error:e.message==='Storage request failed'?'تعذّر الربط. تأكد أن الحسابين غير مربوطين بحساب مختلف، أو اطلب رابطًا جديدًا.':e.message},400)}
 }
 if(request.method!=='POST')return json({error:'طلب غير مسموح'},405);const raw=await request.text();if(raw.length>65536||!validDiscordSignature(raw,request.headers.get('x-signature-timestamp'),request.headers.get('x-signature-ed25519'),DISCORD_PUBLIC_KEY))return json({error:'توقيع غير صالح'},401);
 let i;try{i=JSON.parse(raw)}catch{return json({error:'طلب غير صالح'},400)}if(i.type===1)return json({type:1});if(i.application_id!==DISCORD_APP_ID||!/^\d{17,22}$/.test(i.id||'')||![2,3].includes(i.type)||typeof i.token!=='string'||i.token.length>300)return json({error:'طلب غير صالح'},400);
 discordBackground(processInteraction(i));return json({type:5,data:{flags:64}});
}
