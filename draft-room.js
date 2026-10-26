export function draftPage(){return '<section class="panel"><h2>استوديو الدرافت</h2><p>افتح الدرافت الجديد وابدأ المواجهة.</p><a class="primary" href="draft/">افتح الدرافت</a></section>'}
export function mountDraft(){const code=location.hash.match(/\/draft\/([A-Z0-9]{8})/i)?.[1];location.replace(new URL('draft/'+(code?'#room/'+code.toUpperCase():''),location.href));return()=>{}}
