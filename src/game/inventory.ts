import { WEAPONS, type Ammo, type Material, type Rarity, type WeaponId } from '../core/data.ts';
export interface Weapon { id: WeaponId; rarity: Rarity; mag: number; }
export class Inventory {
  slots: (Weapon | null)[] = Array(5).fill(null);
  selected = 0;
  ammo: Record<Ammo, number> = { light: 48, medium: 60, heavy: 8, shell: 12, rocket: 2 };
  materials: Record<Material, number> = { wood: 90, brick: 30, metal: 20 };
  medkits = 1;
  shields = 2;
  get weapon() { return this.selected === 5 ? null : this.slots[this.selected]; }
  add(id: WeaponId, rarity: Rarity, mag = WEAPONS[id].mag) {
    let n = this.slots.findIndex((x) => !x);
    const full = n < 0;
    if (full) n = Math.min(this.selected, 4);
    const old = this.slots[n];
    this.slots[n] = { id, rarity, mag };
    if (!this.weapon || full) this.selected = n;
    return old;
  }
  drop() { if (this.selected > 4) return null; const w = this.weapon; this.slots[this.selected] = null; return w; }
  swap(a: number, b: number) { if (a < 0 || b < 0 || a > 4 || b > 4) return; [this.slots[a], this.slots[b]] = [this.slots[b], this.slots[a]]; }
  next(d = 1) { for (let i = 1; i <= 6; i++) { const n = (this.selected + d * i + 60) % 6; if (n === 5 || this.slots[n]) { this.selected = n; return; } } }
  reload() { const w = this.weapon; if (!w) return 0; const d = WEAPONS[w.id]; const n = Math.min(d.mag - w.mag, this.ammo[d.ammo]); this.ammo[d.ammo] -= n; w.mag += n; return n; }
  pay(m: Material, cost = 10) { if (this.materials[m] < cost) return false; this.materials[m] -= cost; return true; }
}
