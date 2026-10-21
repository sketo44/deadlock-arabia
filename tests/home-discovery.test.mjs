import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dailyTip,dailyTips,saudiDayKey,quizQuestions,recommendHeroes} from '../home-discovery.js';
import {playstyles} from '../home-playstyles.js';

test('Daily advice stays fixed all Saudi day and rolls at Riyadh midnight',()=>{
 const before=new Date('2026-10-21T20:59:59Z'),after=new Date('2026-10-21T21:00:00Z');
 assert.equal(saudiDayKey(before),'2026-10-21');
 assert.equal(saudiDayKey(after),'2026-10-22');
 assert.deepEqual(dailyTip(before),dailyTip(new Date('2026-10-21T03:00:00Z')));
 assert.notEqual(dailyTip(before).text,dailyTip(after).text);
});
test('Reviewed tip library exceeds 100 distinct tips and completes a cycle without repeats',()=>{
 const audit=JSON.parse(fs.readFileSync(new URL('../data/daily-tips-reviewed.json',import.meta.url)));
 const guide=JSON.parse(fs.readFileSync(new URL('../data/game-guide.json',import.meta.url)));
 const roster=JSON.parse(fs.readFileSync(new URL('../data/home-roster.json',import.meta.url)));
 assert.ok(dailyTips.length>100);
 assert.equal(new Set(dailyTips.map(t=>t[1])).size,dailyTips.length);
 assert.equal(audit.count,dailyTips.length);
 assert.ok(audit.tips.every(t=>t.sources.length&&t.reviewedAt));
 for(const [category,text,route] of dailyTips){
  assert.ok(category&&text.length>=40&&text.length<=260);
  assert.ok(['heroes','items','planner'].includes(route)||guide.topics.some(t=>route==='guide/'+t.id)||roster.some(h=>route==='hero/'+h.id),route);
 }
 assert.equal(new Set(dailyTips.filter(t=>t[0]==='الشخصيات').map(t=>t[2])).size,44);
 const start=Date.parse('2026-10-21T12:00:00Z');
 const cycle=Array.from({length:dailyTips.length},(_,n)=>dailyTip(new Date(start+n*86400000)).text);
 assert.equal(new Set(cycle).size,dailyTips.length);
 assert.equal(dailyTip(new Date(start+dailyTips.length*86400000)).text,cycle[0]);
});
test('Every questionnaire combination returns three distinct real heroes with reasons',()=>{
 const roster=JSON.parse(fs.readFileSync(new URL('../data/home-roster.json',import.meta.url)));
 assert.deepEqual(new Set(playstyles.map(h=>h.id)),new Set(roster.map(h=>h.id)));
 for(const [style] of quizQuestions[0].options)for(const [range] of quizQuestions[1].options)for(const [learning] of quizQuestions[2].options){
  const results=recommendHeroes({style,range,learning});
  assert.equal(results.length,3);assert.equal(new Set(results.map(h=>h.id)).size,3);
  assert.ok(results[0].styles.includes(style));
  assert.ok(results.every(h=>h.reason&&roster.some(r=>r.id===h.id)));
 }
 assert.deepEqual(recommendHeroes({style:'support'}),[]);
 assert.deepEqual(recommendHeroes({style:'made-up',range:'mid',learning:'easy'}),[]);
});
test('Clear playstyle choices yield appropriate starting points',()=>{
 assert.equal(recommendHeroes({style:'frontline',range:'close',learning:'easy'})[0].id,6);
 assert.ok(recommendHeroes({style:'gunner',range:'long',learning:'easy'}).some(h=>h.id===3));
 assert.ok(recommendHeroes({style:'support',range:'mid',learning:'easy'}).every(h=>h.styles.includes('support')));
});
