const pagePattern=/^(?:home|heroes|items|planner|community|patches|account|tournaments|leaderboard|arab-board|guide|model)(?:\/[a-zA-Z0-9_-]+)?$|^hero\/(?:[0-9]+|nurse-harrow)$/;
function cleanPageUrl(url){url.pathname=url.pathname.replace(/\/index\.html$/, '/');url.searchParams.delete('page');if(url.hash==='#home')url.hash='';return url.href}
export function restorePageUrl(href){const url=new URL(href);if(!url.hash){const page=url.searchParams.get('page');if(pagePattern.test(page||''))url.hash=page}const clean=cleanPageUrl(url);return clean===href?null:clean}
export function rememberPageUrl(href){const url=new URL(href);return cleanPageUrl(url)}
