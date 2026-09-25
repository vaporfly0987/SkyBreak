import * as T from 'three';
import { WEAPONS } from '../core/data.ts';
import { clamp } from '../core/math.ts';
import type { Actor } from './actor.ts';
import type { World } from '../world/world.ts';
import type { Building } from './building.ts';
import type { Effects } from '../render/effects.ts';
import type { AudioEngine } from '../render/audio.ts';
export class Combat {
  projectiles:{owner:Actor;pos:T.Vector3;vel:T.Vector3;damage:number;life:number;mesh:T.Mesh}[]=[];
  onHit:(a:Actor,damage:number,head:boolean)=>void=()=>{};
  constructor(public world:World,public actors:Actor[],public building:Building,public effects:Effects,public audio:AudioEngine){}
  reload(a:Actor){const w=a.inventory.weapon;if(!w||a.reload>0||w.mag>=WEAPONS[w.id].mag||a.inventory.ammo[WEAPONS[w.id].ammo]<=0)return false;a.reload=WEAPONS[w.id].reload;a.reloadSlot=a.inventory.selected;a.useTime=0;this.audio.sound('reload',a.isPlayer?0:35);return true;}
  fire(a:Actor,origin:T.Vector3,dir:T.Vector3,aim:boolean,accuracy=1,damageScale=1){
    if(!a.alive||a.cooldown>0||a.reload>0||a.useTime>0)return false;const w=a.inventory.weapon;if(!w)return this.harvest(a,origin,dir);const d=WEAPONS[w.id];if(w.mag===0){this.reload(a);return false;}
    w.mag--;a.shots++;a.shot=.07;a.burst++;a.cooldown=d.burst>1&&a.burst%d.burst===0?.4:d.interval;const damage=d.damage*(1+w.rarity*.09)*damageScale;
    this.audio.sound(w.id==='breaker'?'shotgun':w.id==='longshot'?'sniper':w.id==='comet'?'rocket':'shot',a.isPlayer?0:a.pos.distanceTo(this.actors[0].pos));
    const spread=d.spread*(aim?.3:1)+(1-accuracy)*.13;
    for(let i=0;i<d.pellets;i++){const shot=dir.clone().add(new T.Vector3((Math.random()-.5)*spread,(Math.random()-.5)*spread,(Math.random()-.5)*spread)).normalize();
      if(d.speed){const mesh=new T.Mesh(new T.SphereGeometry(.14,6,4),new T.MeshBasicMaterial({color:0xffaa58}));mesh.position.copy(origin);this.effects.scene.add(mesh);this.projectiles.push({owner:a,pos:origin.clone(),vel:shot.multiplyScalar(d.speed),damage,life:5,mesh});}
      else this.hitscan(a,origin,shot,d.range,damage,d.head);}
    return true;
  }
  hitscan(a:Actor,origin:T.Vector3,dir:T.Vector3,range:number,damage:number,headMultiplier:number){
    const solid=this.world.grid.ray(origin,dir,range);let distance=Math.min(solid.distance,this.world.terrainRay(origin,dir,solid.distance)),victim:Actor|undefined,head=false;const ray=new T.Ray(origin,dir),point=new T.Vector3();
    for(const target of this.actors){if(target===a||!target.alive||!target.deployed)continue;const box=new T.Box3(target.pos.clone().add(new T.Vector3(-.38,.1,-.38)),target.pos.clone().add(new T.Vector3(.38,target.crouch?1.4:1.95,.38)));if(ray.intersectBox(box,point)){const t=point.distanceTo(origin);if(t<distance){distance=t;victim=target;head=point.y-target.pos.y>(target.crouch?1.05:1.5);}}}
    const end=origin.clone().addScaledVector(dir,distance);this.effects.tracer(origin,end,a.isPlayer?0xfff2b8:0xff9e78);
    if(victim){const falloff=clamp(1-(distance/range)*.45,.5,1),amount=victim.damage(damage*(head?headMultiplier:1)*falloff,a.id);a.damageDone+=amount;a.hits++;this.effects.burst(end,victim.shield>0?0x75dfff:0xffffff,5,2);if(a.isPlayer){this.onHit(victim,amount,head);this.audio.sound('hit');}}
    else if(solid.collider&&Math.abs(distance-solid.distance)<.2){const id=solid.collider.owner;if(id){this.building.damage(id,damage*1.2);this.world.harvest(id,damage*.55);}this.effects.burst(end,0xe3cf99,4,2);}
  }
  harvest(a:Actor,origin:T.Vector3,dir:T.Vector3){a.cooldown=.48;a.shot=.18;a.useTime=0;const hit=this.world.grid.ray(origin,dir,3.8),owner=hit.collider?.owner;if(owner){const result=this.world.harvest(owner,30);if(result){a.inventory.materials[result.material]=Math.min(999,a.inventory.materials[result.material]+result.amount);this.effects.burst(hit.point,result.material==='wood'?0xd3ba82:0x92b4c4,10,3);this.audio.sound('harvest',a.isPlayer?0:30);return true;}if(this.building.damage(owner,45)){this.effects.burst(hit.point,0xdab382,8,2);return true;}}
    const target=this.actors.find(t=>t!==a&&t.alive&&t.pos.distanceTo(a.pos)<2.4&&t.pos.clone().sub(a.pos).normalize().dot(dir)>.35);if(target){target.damage(20,a.id);a.damageDone+=20;}return true;
  }
  update(dt:number){for(let i=this.projectiles.length-1;i>=0;i--){const p=this.projectiles[i];p.life-=dt;const delta=p.vel.clone().multiplyScalar(dt),dir=delta.clone().normalize(),length=delta.length(),hit=this.world.grid.ray(p.pos,dir,length);let boom=!!hit.collider||this.world.terrainRay(p.pos,dir,length)<length;const next=p.pos.clone().add(delta);
      if(this.actors.some(a=>a!==p.owner&&a.alive&&a.pos.clone().add(new T.Vector3(0,1,0)).distanceTo(next)<1.2))boom=true;
      p.pos.copy(hit.collider?hit.point:next);p.mesh.position.copy(p.pos);this.effects.burst(p.pos,0xffa85f,1,.5);
      if(boom||p.life<=0){for(const a of this.actors){const d=a.pos.clone().add(new T.Vector3(0,1,0)).distanceTo(p.pos);if(!a.alive||d>7)continue;const amount=a.damage(p.damage*(1-d/8),p.owner.id);p.owner.damageDone+=amount;if(p.owner.isPlayer)this.onHit(a,amount,false);}
        for(const s of this.building.structures)if(s.alive&&s.pos.distanceTo(p.pos)<8)this.building.damage(s.id,p.damage*2);
        this.effects.burst(p.pos,0xffa66b,45,14);this.audio.sound('explosion',p.pos.distanceTo(this.actors[0].pos));this.effects.scene.remove(p.mesh);p.mesh.geometry.dispose();(p.mesh.material as T.Material).dispose();this.projectiles.splice(i,1);}
    }}
}
