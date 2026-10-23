const alphabetical=new Intl.Collator('en',{sensitivity:'base',numeric:true});
export const sortedHeroes=heroes=>[...heroes].sort((a,b)=>alphabetical.compare(a.name,b.name));
