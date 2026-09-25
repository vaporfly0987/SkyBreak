import { Vector3 } from 'three';
import { damp } from '../core/math.ts';
import { terrainHeight, type World } from '../world/world.ts';
import type { Actor } from './actor.ts';
import type { Input } from '../input/input.ts';
export function moveActor(a:Actor,world:World,dt:number,dx:number,dz:number,speed:number,jump=false){
  if(!a.alive||!a.deployed)return;
  const water=terrainHeight(a.pos.x,a.pos.z)<.15&&a.pos.y<.8;const factor=a.grounded?15:3.5;
  a.velocity.x=damp(a.velocity.x,dx*(water?speed*.55:speed),factor,dt);a.velocity.z=damp(a.velocity.z,dz*(water?speed*.55:speed),factor,dt);
  if(jump&&a.grounded){a.velocity.y=8.5;a.grounded=false;a.fallStart=a.pos.y;}
  if(water){a.velocity.y=damp(a.velocity.y,(jump?3:0)+(.25-a.pos.y)*3,5,dt);a.gliding=false;}else a.velocity.y=Math.max(a.gliding?-5.5:-32,a.velocity.y-(a.gliding?12:24)*dt);
  const nx=a.pos.x+a.velocity.x*dt,nz=a.pos.z+a.velocity.z*dt,height=a.crouch?1.2:1.8;
  for(const axis of ['x','z'] as const){const value=axis==='x'?nx:nz,x=axis==='x'?value:a.pos.x,z=axis==='z'?value:a.pos.z,floor=world.height(x,z,a.pos.y),rampUp=floor-a.pos.y;
    if(!world.grid.blocked(x,a.pos.y,z,.4,height)&&rampUp<.8)a.pos[axis]=value;else if(rampUp>0&&rampUp<.7&&!world.grid.blocked(x,floor,z,.4,height)){a.pos[axis]=value;a.pos.y=floor;}else if(jump){const top=world.grid.floor(x,z,a.pos.y+2.4);if(top>a.pos.y&&top<a.pos.y+2.4&&!world.grid.blocked(x,top,z,.4,height)){a.pos[axis]=value;a.pos.y=top;a.velocity.y=0;a.mantle=.35;}}
  }
  const oldY=a.pos.y;a.pos.y+=a.velocity.y*dt;const floor=world.height(a.pos.x,a.pos.z,Math.max(oldY,a.pos.y));
  if(a.pos.y<=floor&&!water){if(!a.grounded&&a.velocity.y<-20&&!a.gliding)a.damage(Math.max(0,(-a.velocity.y-20)*3),'fall',true);a.pos.y=floor;a.velocity.y=0;a.grounded=true;a.gliding=false;}else a.grounded=water;
  if(a.pos.y>oldY&&world.grid.blocked(a.pos.x,a.pos.y,a.pos.z,.38,height)){a.pos.y=oldY;a.velocity.y=Math.min(0,a.velocity.y);}
  a.pos.x=Math.max(-310,Math.min(310,a.pos.x));a.pos.z=Math.max(-310,Math.min(310,a.pos.z));a.mantle=Math.max(0,a.mantle-dt);
}
export function playerMovement(a:Actor,input:Input,world:World,yaw:number,dt:number){
  let x=input.moveX,z=input.moveY;const len=Math.hypot(x,z);if(len>1){x/=len;z/=len;}
  const sprint=input.down('sprint')||input.sprintToggle,crouch=input.settings.mouse.toggleCrouch?input.crouchToggle:input.down('crouch');
  if(crouch&&!a.crouch&&sprint&&a.grounded)a.slide=.8;a.crouch=crouch;a.slide=Math.max(0,a.slide-dt);
  let speed=a.gliding?15:sprint?9:6;if(crouch)speed=a.slide>0?12:3;if(a.useTime>0)speed=2.6;if(input.down('aim')||input.aimToggle)speed*=.65;
  const dx=Math.cos(yaw)*x+Math.sin(yaw)*z,dz=-Math.sin(yaw)*x+Math.cos(yaw)*z;moveActor(a,world,dt,dx,dz,speed,input.consume('jump'));
  if(Math.hypot(dx,dz)>.1&&!input.down('aim')&&!input.aimToggle)a.yaw=Math.atan2(-dx,-dz);else a.yaw=yaw;
}
