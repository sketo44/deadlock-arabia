import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {validSavedBuilds} from '../core.js';
const data=JSON.parse(fs.readFileSync(new URL('../data/snapshot.json',import.meta.url))),good={hero:data.heroes[0].id,title:'بيلد سليم',notes:'',items:[],order:[]};
test('Corrupt saved collections cannot prevent the planner from opening',()=>{for(const v of [{},null,42,'bad'])assert.deepEqual(validSavedBuilds(v,data),[])});
test('Invalid old saves are skipped while valid user builds survive',()=>assert.deepEqual(validSavedBuilds([null,{...good,items:[-1]},good,{...good,order:[9]}],data),[good]));
