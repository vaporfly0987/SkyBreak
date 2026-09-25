export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const damp = (a: number, b: number, s: number, dt: number) => lerp(a, b, 1 - Math.exp(-s * dt));
export const rad = Math.PI / 180;
export function rng(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function hash(x: number, z: number) { return (Math.sin(x * 127.1 + z * 311.7) * 43758.5453) % 1; }
export type Point = { x: number; z: number };
export const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.z - b.z);
export function minutes(t: number) { return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`; }
