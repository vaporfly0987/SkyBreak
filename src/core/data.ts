export type Ammo = 'light' | 'medium' | 'heavy' | 'shell' | 'rocket';
export type Material = 'wood' | 'brick' | 'metal';
export type Piece = 'wall' | 'floor' | 'ramp' | 'cone';
export type Rarity = 0 | 1 | 2 | 3 | 4;
export type WeaponId = 'ranger' | 'pulse' | 'wasp' | 'breaker' | 'longshot' | 'sidekick' | 'comet';
export interface WeaponDef {
  name: string;
  short: string;
  damage: number;
  head: number;
  interval: number;
  mag: number;
  reload: number;
  spread: number;
  recoil: number;
  range: number;
  ammo: Ammo;
  pellets: number;
  burst: number;
  speed: number;
}
export const WEAPONS: Record<WeaponId, WeaponDef> = {
  ranger: { name: 'Ranger AR', short: 'AR', damage: 25, head: 1.6, interval: 0.12, mag: 30, reload: 2.1, spread: 0.022, recoil: 0.8, range: 150, ammo: 'medium', pellets: 1, burst: 1, speed: 0 },
  pulse: { name: 'Pulse Burst', short: 'BR', damage: 23, head: 1.7, interval: 0.085, mag: 24, reload: 2, spread: 0.015, recoil: 0.6, range: 155, ammo: 'medium', pellets: 1, burst: 3, speed: 0 },
  wasp: { name: 'Wasp SMG', short: 'SMG', damage: 16, head: 1.5, interval: 0.07, mag: 32, reload: 1.7, spread: 0.04, recoil: 0.4, range: 70, ammo: 'light', pellets: 1, burst: 1, speed: 0 },
  breaker: { name: 'Breaker Shotgun', short: 'SG', damage: 13, head: 1.4, interval: 0.85, mag: 6, reload: 2.6, spread: 0.075, recoil: 2.4, range: 40, ammo: 'shell', pellets: 8, burst: 1, speed: 0 },
  longshot: { name: 'Longshot', short: 'SR', damage: 80, head: 2, interval: 1.35, mag: 4, reload: 2.8, spread: 0.002, recoil: 3, range: 320, ammo: 'heavy', pellets: 1, burst: 1, speed: 0 },
  sidekick: { name: 'Sidekick', short: 'PST', damage: 28, head: 1.8, interval: 0.24, mag: 14, reload: 1.4, spread: 0.023, recoil: 1, range: 90, ammo: 'light', pellets: 1, burst: 1, speed: 0 },
  comet: { name: 'Comet Launcher', short: 'RKT', damage: 85, head: 1, interval: 1.1, mag: 1, reload: 3, spread: 0.008, recoil: 2, range: 200, ammo: 'rocket', pellets: 1, burst: 1, speed: 48 },
};
export const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
export const RARITY_COLORS = ['#a7b7c8', '#81d567', '#66beff', '#c389ff', '#ffd564'];
export const MATERIALS: Record<Material, { hp: number; time: number; color: number }> = {
  wood: { hp: 160, time: 3, color: 0xcf9d63 }, brick: { hp: 280, time: 5, color: 0xb87562 }, metal: { hp: 420, time: 7, color: 0x7a9baa },
};
export const PIECES: Piece[] = ['wall', 'floor', 'ramp', 'cone'];
export const POIS = [
  { name: 'SUNLIT SQUARE', x: -96, z: 38, r: 45, color: '#edba79' },
  { name: 'TIDAL WORKS', x: 143, z: 100, r: 37, color: '#8bd4d7' },
  { name: 'PINEWATCH', x: -116, z: -145, r: 30, color: '#9edc80' },
  { name: 'ORBIT OBSERVATORY', x: 108, z: -149, r: 30, color: '#bdb4ef' },
  { name: 'CINDER CAMP', x: 5, z: 172, r: 26, color: '#f3a482' },
  { name: 'THE CROSSING', x: 58, z: 0, r: 20, color: '#8ce4e1' },
];
export const DIFFICULTIES = {
  relaxed: { accuracy: 0.2, reaction: 1.1, damage: 0.7, build: 0.12, aggression: 0.6 },
  standard: { accuracy: 0.38, reaction: 0.65, damage: 0.9, build: 0.28, aggression: 0.85 },
  veteran: { accuracy: 0.62, reaction: 0.3, damage: 1, build: 0.52, aggression: 1.2 },
};
export type Difficulty = keyof typeof DIFFICULTIES;
export const BOT_NAMES = ['Kestrel','Nova','Pebble','Mako','Juniper','Echo','Tango','Wren','Drift','Atlas','Comet','Moss','Bolt','Piper','Indigo','Clover','Jolt','Finch','Copper','Onyx','Skipper','Lumen','Pixel','Scout'];
