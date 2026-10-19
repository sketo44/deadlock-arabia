export const MAX_ITEMS=12;
export function validSavedBuilds(value,data){if(!Array.isArray(value))return [];return value.flatMap(b=>{try{return [validateBuild(b,data)]}catch{return []}}).slice(0,50)}
export function total(ids,items){return ids.reduce((n,id)=>n+(items.find(i=>i.id===id)?.cost||0),0)}
export function validateBuild(b,data){if(!b||!data.heroes.some(h=>h.id===b.hero)||!Array.isArray(b.items)||b.items.length>MAX_ITEMS||new Set(b.items).size!==b.items.length||b.items.some(id=>!data.items.some(i=>i.id===id&&i.type==='upgrade')))throw Error('بيانات البيلد غير صالحة أو لا تطابق إصدار اللعبة');if(!Array.isArray(b.order)||b.order.length>16||b.order.some(n=>!Number.isInteger(n)||n<0||n>3)||[0,1,2,3].some(n=>b.order.filter(x=>x===n).length>4))throw Error('ترتيب القدرات غير صالح');return {hero:b.hero,items:b.items,order:b.order,title:String(b.title||'بيلد جديد').slice(0,80),notes:String(b.notes||'').slice(0,2000)}}
export function encode(b){return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(b)))) .replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}
export function decode(s){if(s.length>15000)throw Error('الرابط طويل جدًا');return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0))))}
export function pointCost(order){return [0,1,2,3].reduce((sum,n)=>{const count=order.filter(x=>x===n).length;return sum+([0,0,1,3,8][count]||0)},0)}
export function safeUrl(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:'#'}catch{return '#'}}
