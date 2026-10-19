// Supabase owns the OAuth state and provider exchange. Only basic identity scopes.
export function googleLoginUrl(base,site){
 const project=new URL(base),origin=new URL(site);
 if(project.protocol!=='https:'||!/^[a-z0-9-]+\.supabase\.co$/.test(project.hostname))throw Error('إعداد الدخول غير صالح');
 if(origin.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(origin.hostname))throw Error('رابط العودة غير آمن');
 const url=new URL('/auth/v1/authorize',project);
 url.searchParams.set('provider','google');url.searchParams.set('redirect_to',origin.origin+'/');
 url.searchParams.set('scopes','openid email profile');url.searchParams.set('prompt','select_account');
 return url.href;
}
