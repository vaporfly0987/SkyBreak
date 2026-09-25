/** Shared end-of-match rule. Training never auto-completes. */
export function matchResult(training:boolean,playerAlive:boolean,playerDeployed:boolean,remaining:number):{win:boolean;placement:number}|null{
  if(training)return null;
  if(!playerAlive)return{win:false,placement:Math.max(2,remaining+1)};
  if(playerDeployed&&remaining===1)return{win:true,placement:1};
  return null;
}
