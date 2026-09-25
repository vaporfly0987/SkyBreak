import * as T from 'three';
import { MATERIALS, PIECES, type Piece, type Material } from '../core/data.ts';
import { clamp, dist } from '../core/math.ts';
import type { World } from '../world/world.ts';
import type { Actor } from './actor.ts';

export interface Structure {
  id:string; owner:string; piece:Piece; material:Material; pos:T.Vector3; rotation:number; hp:number; max:number;
  age:number; cells:boolean[]; mesh:T.Group; alive:boolean;
}
export class Building {
  structures:Structure[]=[]; preview=new T.Group(); enabled=false; piece:Piece='wall'; material:Material='wood';
  rotation=0; valid=false; position=new T.Vector3(); edit:Structure|null=null; selection=Array(9).fill(false) as boolean[]; nextId=0; previewKey='';
  constructor(public world:World,public scene:T.Scene){scene.add(this.preview);}
  updatePreview(player:Actor,dir:T.Vector3){
    this.preview.visible=this.enabled;if(!this.enabled)return;
    this.position.set(Math.round((player.pos.x+dir.x*5)/4)*4,5+Math.round((player.pos.y-5+Math.max(0,dir.y)*4)/3.2)*3.2,Math.round((player.pos.z+dir.z*5)/4)*4);
    const dummy=this.createData('preview',player.id,this.piece,this.material,this.position,this.rotation);
    this.valid=this.canPlace(dummy,player);
    const key=[this.position.x,this.position.y,this.position.z,this.piece,this.rotation,this.valid].join(',');
    if(key===this.previewKey)return;this.previewKey=key;
    for(const group of [...this.preview.children]){this.disposeMesh(group as T.Group);this.preview.remove(group);}
    this.visual(dummy,this.valid?0xa4f778:0xff6969,.38,false);this.preview.add(dummy.mesh);
  }
  createData(id:string,owner:string,piece:Piece,material:Material,pos:T.Vector3,rotation:number):Structure{
    return{id,owner,piece,material,pos:pos.clone(),rotation,hp:25,max:MATERIALS[material].hp,age:0,cells:Array(9).fill(false),mesh:new T.Group(),alive:true};
  }
  canPlace(s:Structure,a:Actor){
    if(a.inventory.materials[s.material]<10||dist(s.pos,a.pos)>9)return false;
    if(this.structures.some(b=>b.alive&&b.piece===s.piece&&b.pos.distanceTo(s.pos)<.1&&b.rotation%2===s.rotation%2))return false;
    const h=this.world.height(s.pos.x,s.pos.z,s.pos.y+.2);
    const supported=Math.abs(s.pos.y-h)<3.5||this.structures.some(b=>b.alive&&Math.abs(b.pos.y-s.pos.y)<3.3&&dist(b.pos,s.pos)<4.2);
    if(!supported)return false;
    const bounds=new T.Box3(new T.Vector3(s.pos.x-1.8,s.pos.y+.3,s.pos.z-1.8),new T.Vector3(s.pos.x+1.8,s.pos.y+2.8,s.pos.z+1.8));
    if(this.world.grid.query(bounds).some(c=>(!c.owner||c.kind==='resource')&&c.box.max.y>s.pos.y+.5))return false;
    if(s.piece==='wall'){
      const local=a.pos.clone().sub(s.pos).applyAxisAngle(new T.Vector3(0,1,0),(-s.rotation*Math.PI)/2);
      if(Math.abs(local.x)<2.45&&Math.abs(local.z+2)<.65&&local.y<3.2&&local.y>-1.8)return false;
    }
    return true;
  }
  place(a:Actor){
    const s=this.createData('build-'+this.nextId++,a.id,this.piece,this.material,this.position,this.rotation);
    if(!this.canPlace(s,a)||!a.inventory.pay(this.material))return null;this.structures.push(s);this.scene.add(s.mesh);this.rebuild(s);return s;
  }
  placeBot(a:Actor,enemy:T.Vector3,edit=false){
    const s=this.createData('build-'+this.nextId++,a.id,'wall','wood',new T.Vector3(Math.round(a.pos.x/4)*4,5+Math.round((a.pos.y-5)/3.2)*3.2,Math.round(a.pos.z/4)*4),0);
    const yaw=Math.atan2(a.pos.x-enemy.x,a.pos.z-enemy.z);s.rotation=Math.round(yaw/(Math.PI/2));
    if(!this.canPlace(s,a)||!a.inventory.pay('wood'))return null;if(edit)s.cells[4]=true;
    this.structures.push(s);this.scene.add(s.mesh);this.rebuild(s);return s;
  }
  visual(s:Structure,color=MATERIALS[s.material].color,opacity=1,collide=true){
    const mat=new T.MeshStandardMaterial({color,transparent:opacity<1,opacity,roughness:.8,metalness:s.material==='metal'?.4:0});
    const cube=(x:number,y:number,z:number,w:number,h:number,d:number)=>{
      const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);s.mesh.add(m);m.castShadow=true;m.receiveShadow=true;
      if(collide){
        const c=m.position.clone().applyAxisAngle(new T.Vector3(0,1,0),(s.rotation*Math.PI)/2).add(s.pos),odd=Math.abs(s.rotation)%2;
        this.world.grid.add(new T.Box3(new T.Vector3(c.x-(odd?d:w)/2,c.y-h/2,c.z-(odd?w:d)/2),new T.Vector3(c.x+(odd?d:w)/2,c.y+h/2,c.z+(odd?w:d)/2)),'structure',s.id);
      }
    };
    if(s.piece==='wall')for(let row=0;row<3;row++)for(let col=0;col<3;col++)if(!s.cells[row*3+col])cube(((col-1)*4)/3,3.2-((row+.5)*3.2)/3,-2,4/3-.015,3.2/3-.015,.22);
    else if(s.piece==='floor')for(let row=0;row<3;row++)for(let col=0;col<3;col++)if(!s.cells[row*3+col])cube(((col-1)*4)/3,.05,((row-1)*4)/3,4/3,.16,4/3);
    else if(s.piece==='ramp')for(let i=0;i<12;i++){const h=((i+1)*3.2)/12;cube(0,h/2,2-((i+.5)*4)/12,4,h,4/12+.01);}
    else for(let i=0;i<6;i++){const size=4-i*.64;if(!s.cells.some(Boolean)){cube(0,i*.26+.13,0,size,.26,size);continue;}for(let row=0;row<3;row++)for(let col=0;col<3;col++){if(s.cells[row*3+col])continue;const x0=Math.max(-size/2,-2+(col*4)/3),x1=Math.min(size/2,-2+((col+1)*4)/3),z0=Math.max(-size/2,-2+(row*4)/3),z1=Math.min(size/2,-2+((row+1)*4)/3);if(x1>x0&&z1>z0)cube((x0+x1)/2,i*.26+.13,(z0+z1)/2,x1-x0,.26,z1-z0);}}
    s.mesh.position.copy(s.pos);s.mesh.rotation.y=(s.rotation*Math.PI)/2;s.mesh.userData.id=s.id;
  }
  rebuild(s:Structure){this.world.grid.removeOwner(s.id);this.disposeMesh(s.mesh);this.visual(s,MATERIALS[s.material].color,.55+.45*clamp(s.age/MATERIALS[s.material].time,0,1));}
  disposeMesh(g:T.Group){const materials=new Set<T.Material>();for(const o of [...g.children]){const m=o as T.Mesh;m.geometry?.dispose();if(m.material)(Array.isArray(m.material)?m.material:[m.material]).forEach(a=>materials.add(a));g.remove(o);}materials.forEach(m=>m.dispose());}
  update(dt:number){for(const s of this.structures){if(!s.alive)continue;const d=MATERIALS[s.material];if(s.age<d.time){s.hp=Math.min(s.max,s.hp+((s.max-25)*dt)/d.time);s.age+=dt;const opacity=.55+.45*clamp(s.age/d.time,0,1);for(const c of s.mesh.children){const m=(c as T.Mesh).material as T.MeshStandardMaterial;m.opacity=opacity;m.transparent=opacity<1;}}}}
  damage(id:string,n:number){const s=this.structures.find(s=>s.id===id&&s.alive);if(!s)return false;s.hp-=n;if(s.hp<=0){s.alive=false;this.world.grid.removeOwner(s.id);this.scene.remove(s.mesh);this.disposeMesh(s.mesh);}return true;}
  beginEdit(a:Actor,dir:T.Vector3){const hit=this.world.grid.ray(a.pos.clone().add(new T.Vector3(0,1.5,0)),dir,9);this.edit=this.structures.find(s=>s.alive&&s.owner===a.id&&s.id===hit.collider?.owner)||this.structures.filter(s=>s.alive&&s.owner===a.id&&dist(s.pos,a.pos)<7).sort((s,t)=>dist(s.pos,a.pos)-dist(t.pos,a.pos))[0]||null;if(this.edit)this.selection=[...this.edit.cells];return this.edit;}
  confirmEdit(reset=false){if(!this.edit)return false;const s=this.edit;if(reset){s.cells.fill(false);s.rotation=0;}else if(s.piece==='ramp')s.rotation=(s.rotation+1)%4;else{if(this.selection.every(v=>v))return false;s.cells=[...this.selection];}this.rebuild(s);this.edit=null;return true;}
  cycle(d=1){this.piece=PIECES[(PIECES.indexOf(this.piece)+d+4)%4];}
  dispose(){for(const s of this.structures){this.scene.remove(s.mesh);this.world.grid.removeOwner(s.id);this.disposeMesh(s.mesh);}this.structures=[];this.preview.traverse(o=>{const m=o as T.Mesh;m.geometry?.dispose();});this.scene.remove(this.preview);}
}
