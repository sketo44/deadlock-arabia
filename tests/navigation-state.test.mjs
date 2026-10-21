import test from 'node:test';
import assert from 'node:assert/strict';
import {restorePageUrl,rememberPageUrl} from '../navigation-state.js';

test('Hero routes survive a reload that drops the fragment',()=>{
 for(const hero of ['35','nurse-harrow']){
  const remembered=new URL(rememberPageUrl(`https://example.com/?v=64#hero/${hero}`));
  assert.equal(remembered.searchParams.get('v'),'64');
  remembered.hash='';
  assert.equal(new URL(restorePageUrl(remembered.href)).hash,`#hero/${hero}`);
 }
});
test('Explicit navigation and authentication fragments take priority',()=>{
 for(const hash of ['#home','#hero/6','#access_token=private&type=recovery']){
  assert.equal(restorePageUrl('https://example.com/?page=hero%2F35'+hash),null);
 }
 assert.equal(rememberPageUrl('https://example.com/#access_token=private&type=recovery'),null);
 assert.equal(restorePageUrl('https://example.com/?page=javascript:alert(1)'),null);
 assert.equal(restorePageUrl('https://example.com/'),null);
 assert.equal(new URL(rememberPageUrl('https://example.com/?page=hero%2F35#home')).searchParams.get('page'),'home');
});
