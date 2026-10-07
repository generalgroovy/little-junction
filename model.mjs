export const STATIONS={sun:{name:'Sun',symbol:'☀'},moon:{name:'Moon',symbol:'☾'},leaf:{name:'Leaf',symbol:'♧'}};
export const NODES={entry:{x:6,y:50,next:['fork']},fork:{x:29,y:50,next:['upper','lower']},upper:{x:53,y:24,next:['sun','moon']},lower:{x:53,y:76,next:['moon','leaf']},sun:{x:88,y:9},moon:{x:88,y:50},leaf:{x:88,y:91}};
export const WAVES=[{name:'First deliveries',carts:['sun','moon','leaf']},{name:'A change of track',carts:['leaf','sun','moon','leaf','moon']},{name:'Meeting in the middle',carts:['moon','moon','sun','leaf','moon','sun','leaf']},{name:'Rush of small things',carts:['leaf','sun','moon','moon','leaf','sun','leaf','moon','sun','moon']}];
export function create(level=0){if(!Number.isInteger(level)||level<0||level>=WAVES.length)throw Error('Choose an available route.');return {level,switches:{fork:0,upper:0,lower:0},waiting:[...WAVES[level].carts],carts:[],delivered:0,wrong:0,tick:0,nextId:0,events:[],finished:false};}
export function setSwitch(state,node,choice){if(!['fork','upper','lower'].includes(node)||![0,1].includes(choice))throw Error('Invalid junction direction.');return {...state,switches:{...state.switches,[node]:choice},events:[]};}
export function step(state){
  if(state.finished)return structuredClone(state);
  const next=structuredClone(state);next.tick++;next.events=[];
  // Stations are exits. Resolve carts closest to an exit first; arrival id
  // breaks ties so simultaneous contenders have a stable, fair priority.
  const rank={upper:0,lower:0,fork:1,entry:2};
  const occupancy=new Set(next.carts.map(c=>c.node));
  const sorted=[...next.carts].sort((a,b)=>rank[a.node]-rank[b.node]||a.id-b.id);
  const remove=new Set();
  for(const cart of sorted){
    const node=NODES[cart.node],dest=node.next[next.switches[cart.node]??0];
    if(STATIONS[dest]){
      occupancy.delete(cart.node);remove.add(cart.id);
      const correct=dest===cart.target;
      next[correct?'delivered':'wrong']++;
      next.events.push({type:correct?'delivered':'wrong',target:cart.target,station:dest,id:cart.id});
    }else if(!occupancy.has(dest)){
      occupancy.delete(cart.node);occupancy.add(dest);cart.node=dest;
    }else next.events.push({type:'wait',id:cart.id});
  }
  next.carts=next.carts.filter(c=>!remove.has(c.id));
  if(next.waiting.length&&!occupancy.has('entry'))next.carts.push({id:next.nextId++,target:next.waiting.shift(),node:'entry'});
  next.finished=!next.waiting.length&&!next.carts.length;
  return next;
}
export function won(s){return s.finished&&s.wrong===0&&s.delivered===WAVES[s.level].carts.length;}
export function solvePath(target){return target==='sun'?{fork:0,upper:0}:target==='leaf'?{fork:1,lower:1}:{fork:0,upper:1};}
