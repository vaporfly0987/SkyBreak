import { Vector3 } from 'three';
import { Character } from '../render/character.ts';
import { Inventory } from './inventory.ts';

export class Actor {
  pos = new Vector3();
  velocity = new Vector3();
  model: Character;
  inventory = new Inventory();
  health = 100;
  shield = 0;
  alive = true;
  grounded = false;
  crouch = false;
  gliding = false;
  deployed = false;
  yaw = 0;
  cooldown = 0;
  reload = 0;
  reloadSlot = -1;
  useTime = 0;
  useKind = '';
  hurt = 0;
  shot = 0;
  kills = 0;
  damageDone = 0;
  shots = 0;
  hits = 0;
  lastAttacker = 'storm';
  fallStart = 0;
  slide = 0;
  mantle = 0;
  targetPos: Vector3 | null = null;
  burst = 0;
  lastBurst = 0;

  constructor(public id: string, public name: string, color: number, public isPlayer = false) {
    this.model = new Character(color);
  }

  damage(amount: number, from = 'storm', bypass = false) {
    if (!this.alive) return 0;
    const before = this.health + this.shield;
    if (!bypass) {
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      amount -= absorbed;
    }
    this.health = Math.max(0, this.health - amount);
    this.hurt = 1;
    this.lastAttacker = from;
    this.useTime = 0;
    this.useKind = '';
    if (this.health === 0) this.alive = false;
    return before - this.health - this.shield;
  }

  tick(dt: number) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.hurt = Math.max(0, this.hurt - dt);
    this.shot = Math.max(0, this.shot - dt);
    if (this.reload > 0) {
      this.reload -= dt;
      if (this.reload <= 0 && this.reloadSlot === this.inventory.selected) this.inventory.reload();
    }
    if (this.useTime > 0) {
      this.useTime -= dt;
      if (this.useTime <= 0) {
        if (this.useKind === 'heal' && this.inventory.medkits > 0) {
          this.health = Math.min(100, this.health + 75);
          this.inventory.medkits--;
        }
        if (this.useKind === 'shield' && this.inventory.shields > 0) {
          this.shield = Math.min(100, this.shield + 50);
          this.inventory.shields--;
        }
        this.useKind = '';
      }
    }
    this.model.root.position.copy(this.pos);
    this.model.root.rotation.y = this.yaw;
    this.model.root.visible = this.alive;
    this.model.update(
      dt,
      Math.hypot(this.velocity.x, this.velocity.z),
      this.grounded,
      this.gliding,
      this.crouch,
      this.shot > 0,
      this.reload,
    );
  }

  use(kind: string) {
    if (this.useTime > 0 || this.reload > 0) return false;
    if (kind === 'heal' && (this.health >= 100 || !this.inventory.medkits)) return false;
    if (kind === 'shield' && (this.shield >= 100 || !this.inventory.shields)) return false;
    this.useKind = kind;
    this.useTime = kind === 'heal' ? 3.5 : 2.2;
    return true;
  }
}
