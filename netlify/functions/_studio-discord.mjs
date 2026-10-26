import {db} from './_shared/store.mjs';
import {discordConfigured,discordRequest} from './_discord-service.mjs';
import {discordResultPng} from './_discord-image.mjs';
export async function notifyStudioResult(code){
 if(!discordConfigured())return;
 let row=(await db('draft_lobbies?code=eq.'+code+'&select=state,version'))[0];if(!row||!row.state.studio||row.state.status!=='complete'||row.state.config.mode==='mock'||row.state.delivery?.messageId||row.state.delivery?.lease>Date.now())return;
 const state=structuredClone(row.state);state.delivery={lease:Date.now()+120000,attempts:(state.delivery?.attempts||0)+1};if(state.delivery.attempts>5)return;
 if(!await db('rpc/update_draft',{method:'POST',body:JSON.stringify({p_code:code,p_version:row.version,p_state:state})}))return;
 try{
 const png=await discordResultPng(state),form=new FormData();form.append('files[0]',new Blob([png],{type:'image/png'}),'draft-result.png');form.append('payload_json',JSON.stringify({attachments:[{id:0,filename:'draft-result.png'}],allowed_mentions:{parse:[]},nonce:BigInt('0x'+Buffer.from(code).toString('hex')).toString(),enforce_nonce:true}));
 const channel=process.env.DISCORD_RESULTS_CHANNEL_ID||process.env.DISCORD_CHANNEL_ID,sent=await discordRequest('/channels/'+channel+'/messages',form);
 for(let i=0;i<3;i++){row=(await db('draft_lobbies?code=eq.'+code+'&select=state,version'))[0];row.state.delivery={messageId:sent.id,channelId:channel,sentAt:Date.now()};if(await db('rpc/update_draft',{method:'POST',body:JSON.stringify({p_code:code,p_version:row.version,p_state:row.state})}))break}
 if(state.discordQueueId)await db('discord_queues?id=eq.'+state.discordQueueId,{method:'PATCH',body:JSON.stringify({result_message_id:sent.id})});
 }catch{ /* The lease allows a later room poll or scheduled sweep to retry. */ }
}
