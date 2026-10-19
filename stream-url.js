export function normalizeStreamUrl(input){
 if(input===undefined||input==='')return '';
 if(typeof input!=='string'||input.length>300)throw Error('رابط البث غير صحيح');
 let u;try{u=new URL(input.trim())}catch{throw Error('حط رابط قناة Twitch أو بث TikTok')}
 if(u.protocol!=='https:'||u.username||u.password||u.port)throw Error('استخدم رابط بث آمن');
 const twitch=u.hostname==='twitch.tv'||u.hostname==='www.twitch.tv';
 const tiktok=u.hostname==='tiktok.com'||u.hostname==='www.tiktok.com';
 if(twitch&&/^\/[a-zA-Z0-9_]{3,25}\/?$/.test(u.pathname))return 'https://www.twitch.tv/'+u.pathname.split('/')[1].toLowerCase();
 if(tiktok&&/^\/@[a-zA-Z0-9_.]{2,24}\/live\/?$/.test(u.pathname))return 'https://www.tiktok.com'+u.pathname.replace(/\/$/,'');
 throw Error('المسموح رابط قناة Twitch أو رابط TikTok ينتهي بـ /live');
}
