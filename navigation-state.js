const pagePattern=/^(?:home|heroes|items|planner|community|patches|account|tournaments|leaderboard|arab-board|guide|model)(?:\/[a-zA-Z0-9_-]+)?$|^hero\/(?:[0-9]+|nurse-harrow)$/;
export function restorePageUrl(href){const url=new URL(href);if(url.hash)return null;const page=url.searchParams.get('page');if(!pagePattern.test(page||''))return null;url.hash=page;return url.href}
export function rememberPageUrl(href){const url=new URL(href),page=url.hash.slice(1);if(!pagePattern.test(page))return null;url.searchParams.set('page',page);return url.href}
