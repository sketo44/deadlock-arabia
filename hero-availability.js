// Development metadata does not override a hero being selectable in the game.
export const isSelectableHero = hero => Boolean(hero.player_selectable) && !hero.disabled;
