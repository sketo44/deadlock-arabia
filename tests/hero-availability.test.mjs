import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {isSelectableHero} from '../hero-availability.js';
test('Selectable development heroes remain available; disabled and unselectable entries stay hidden',()=>{
 assert.equal(isSelectableHero({player_selectable:true,in_development:true,disabled:false}),true);
 assert.equal(isSelectableHero({player_selectable:true,in_development:false,disabled:true}),false);
 assert.equal(isSelectableHero({player_selectable:false,in_development:false,disabled:false}),false);
});
test('Violet and Baba have complete local hero, story, wallpaper and ability records',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../data/snapshot.json',import.meta.url)));
 const lore=JSON.parse(fs.readFileSync(new URL('../data/hero-lore.json',import.meta.url)));
 for(const id of [86,88]){const hero=data.heroes.find(h=>h.id===id),story=lore.find(h=>h.id===id);assert.ok(hero);assert.ok(story.storyAr.length>1);const wallpapers=JSON.parse(fs.readFileSync(new URL('../data/hero-wallpapers.json',import.meta.url)));const wallpaper=wallpapers.heroes.find(h=>h.id===id);assert.ok(wallpaper);assert.ok(fs.existsSync(new URL('../'+wallpaper.image,import.meta.url)));assert.equal(hero.abilities.length,4);for(const name of hero.abilities){const ability=data.items.find(i=>i.class_name===name);assert.ok(ability?.ar);assert.equal(ability.upgrades.length,3);assert.ok(fs.existsSync(new URL('../'+ability.image,import.meta.url)))}}
});
