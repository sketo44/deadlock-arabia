export const scheduleFields={registration_opens_at:'فتح التسجيل',registration_closes_at:'إقفال التسجيل',starts_at:'بداية المباريات'};
export function readTournamentSchedule(values){
 const result={};
 const fail=(field,message)=>{const error=new Error(message);error.field=field;throw error};
 for(const [field,label]of Object.entries(scheduleFields)){
  const value=String(values[field]||''),match=value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/);
  if(!match)fail(field,'اختر تاريخ ووقت '+label+' من التقويم.');
  if(+match[1]<2000||+match[1]>2100)fail(field,'سنة '+label+' غير صحيحة. استخدم التاريخ الميلادي، مثل 2026، واختره من التقويم.');
  const normalized=value+(match[6]?'':':00')+'+03:00',timestamp=Date.parse(normalized);
  if(!Number.isFinite(timestamp))fail(field,'تاريخ '+label+' غير صحيح.');
  // Date.parse normalizes impossible calendar dates in some browsers; reject those too.
  const parts=new Date(timestamp+3*3600000).toISOString();
  if(parts.slice(0,16)!==value.slice(0,16))fail(field,'تاريخ '+label+' غير موجود في التقويم.');
  result[field]=new Date(timestamp).toISOString();
 }
 if(Date.parse(result.registration_closes_at)<=Date.parse(result.registration_opens_at))fail('registration_closes_at','إقفال التسجيل لازم يكون بعد فتح التسجيل. عدّل موعد الإقفال.');
 if(Date.parse(result.starts_at)<Date.parse(result.registration_closes_at))fail('starts_at','بداية المباريات قبل إقفال التسجيل. قدّم الإقفال أو أخّر بداية المباريات.');
 return result;
}
