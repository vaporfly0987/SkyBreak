import { rng, lerp, dist, type Point } from '../core/math.ts';
export class Storm {
  center: Point={x:0,z:0}; next: Point={x:0,z:0}; radius=285; nextRadius=220; phase=0; time=0; remaining=0; closing=false; damage=1;
  private rings:{center:Point;radius:number}[]=[];
  constructor(public duration=480,seed=731){
    const rand=rng(seed); let p={x:0,z:0},r=285; this.rings.push({center:p,radius:r});
    for(const nr of [220,155,95,48,19,5,0]){const a=rand()*Math.PI*2,d=(r-nr)*.6;p={x:p.x+Math.sin(a)*d,z:p.z+Math.cos(a)*d};this.rings.push({center:p,radius:nr});r=nr;}
    this.update(0);
  }
  update(dt:number){this.time+=dt;const stage=this.duration/7;this.phase=Math.min(6,Math.floor(this.time/stage));const t=(this.time-this.phase*stage)/stage;this.closing=t>.45;const a=this.rings[this.phase],b=this.rings[this.phase+1],k=Math.max(0,Math.min(1,(t-.45)/.55));this.center={x:lerp(a.center.x,b.center.x,k),z:lerp(a.center.z,b.center.z,k)};this.radius=lerp(a.radius,b.radius,k);this.next=b.center;this.nextRadius=b.radius;this.remaining=Math.max(0,(this.closing?1-t:.45-t)*stage);this.damage=[1,2,3,5,8,12,18][this.phase];}
  outside(p:Point){return dist(p,this.center)>this.radius;}
}
