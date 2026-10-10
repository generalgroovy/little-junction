import {STATIONS,NODES,WAVES,create,setSwitch,step,won,nextWarning} from './model.mjs';
const $=id=>document.getElementById(id);let state=create(),history=[],timer=null;
const names={fork:'Fork',upper:'Upper',lower:'Lower'};
const ns='http://www.w3.org/2000/svg';
for(const [id,node] of Object.entries(NODES))for(const [index,dest] of (node.next??[]).entries()){const edge=document.createElementNS(ns,'path');edge.setAttribute('d',`M ${node.x} ${node.y} L ${NODES[dest].x} ${NODES[dest].y}`);edge.dataset.node=id;edge.dataset.choice=index;$('tracks').append(edge);}
for(const [id,station] of Object.entries(STATIONS)){const el=document.createElement('div');el.className=`station ${id}`;el.style.left=`${NODES[id].x}%`;el.style.top=`${NODES[id].y}%`;const symbol=document.createElement('span');symbol.textContent=station.symbol;el.append(symbol,document.createTextNode(station.name));$('stations').append(el);}
for(const [id,name] of Object.entries(names)){const b=document.createElement('button');b.id=`switch-${id}`;b.className='junction';b.style.left=`${NODES[id].x}%`;b.style.top=`${NODES[id].y}%`;b.onclick=()=>change(()=>state=setSwitch(state,id,1-state.switches[id]));$('switches').append(b);}
WAVES.forEach((w,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${i+1}. ${w.name}`;$('level').append(o);});
function pause(){if(timer!==null)clearInterval(timer);timer=null;$('play').textContent='Auto step';$('play').setAttribute('aria-pressed','false');}
function change(fn){history.push(structuredClone(state));if(history.length>150)history.shift();fn();render();}
function advance(){change(()=>state=step(state));if(state.finished||state.events.some(e=>e.type==='wrong')){pause();if(state.finished)$('undo').focus();}}
function render(){
  $('chapter').textContent=`ROUTE ${state.level+1} / ${WAVES.length}`;$('title').textContent=WAVES[state.level].name;$('level').value=state.level;
  $('arrivals').replaceChildren(...state.waiting.slice(0,3).map(t=>{const e=document.createElement('span');e.className=`arrival ${t}`;e.textContent=`${STATIONS[t].symbol} ${STATIONS[t].name}`;return e;}));
  if(state.waiting.length>3){const more=document.createElement('span');more.textContent=`+ ${state.waiting.length-3} more`;$('arrivals').append(more);}
  if(!state.waiting.length)$('arrivals').textContent='No more carts';
  $('arrival-details').hidden=state.waiting.length<=3&&!$('arrival-details').open&&!$('arrival-details').contains(document.activeElement);$('full-arrivals').textContent=state.waiting.length?state.waiting.map(t=>`${STATIONS[t].symbol} ${STATIONS[t].name}`).join(' → '):'No more carts';
  const forecast=nextWarning(state);$('warning').hidden=!forecast;
  if(forecast)$('warning').textContent=forecast.canReroute?`Next step: ${STATIONS[forecast.target].name} would reach ${STATIONS[forecast.station].name}. Change ${names[forecast.junction]} first.`:`${STATIONS[forecast.target].name} cannot reach its station from ${names[forecast.junction]}. Undo to reroute it.`;
  for(const [id,name] of Object.entries(names)){const target=NODES[id].next[state.switches[id]],label=STATIONS[target]?.name??names[target];$(`switch-${id}`).textContent=`${name} → ${label}`;$(`switch-${id}`).setAttribute('aria-label',`${name} junction, routing to ${label}. Activate to switch.`);}
  document.querySelectorAll('.dispatch path').forEach(path=>{path.setAttribute('class',`track ${Number(path.dataset.choice)===(state.switches[path.dataset.node]??0)?'active':''}`);});
  $('carts').replaceChildren(...state.carts.map(c=>{const el=document.createElement('span');el.className=`cart ${c.target}`;el.style.left=`${NODES[c.node].x}%`;el.style.top=`${NODES[c.node].y}%`;el.textContent=STATIONS[c.target].symbol;el.setAttribute('role','img');el.setAttribute('aria-label',`${STATIONS[c.target].name} cart at ${names[c.node]??'entry'}`);return el;}));
  const mistake=state.events.find(e=>e.type==='wrong'),arrival=state.events.filter(e=>e.type==='delivered');
  $('feedback').textContent=state.finished?(won(state)?'All carts delivered to the correct stations.':'Route complete with wrong deliveries. Undo or start again to correct them.'):mistake?`${STATIONS[mistake.target].name} cart reached ${STATIONS[mistake.station].name}. Playback paused. Undo lets you reroute it.`:arrival.length?`${arrival.map(e=>STATIONS[e.target].name).join(' and ')} delivered.`:state.tick===0?'The first cart is for Sun. Upper → Sun is ready. Step time to let it in.':'Turn junctions before the next step. A cart always follows the highlighted track.';
  if(state.tick===0)$('feedback').textContent=`Press Step to bring in the ${STATIONS[WAVES[state.level].carts[0]].name} cart.`;
  $('progress').textContent=`${state.delivered} / ${WAVES[state.level].carts.length} delivered${state.wrong?` · ${state.wrong} wrong`:''}`;
  $('step').disabled=state.finished;$('play').disabled=state.finished;$('undo').disabled=!history.length;$('next').hidden=!won(state)||state.level===WAVES.length-1;
}
$('step').onclick=()=>{pause();advance();};
$('play').onclick=()=>{if(timer!==null)pause();else{$('play').textContent='Pause';$('play').setAttribute('aria-pressed','true');timer=setInterval(advance,1400);}};
$('undo').onclick=()=>{pause();if(history.length){state=history.pop();render();if(!history.length)$('step').focus();}};
$('reset').onclick=()=>{pause();change(()=>state=create(state.level));};
$('level').onchange=()=>{pause();const next=Number($('level').value);change(()=>state=create(next));};
$('next').onclick=()=>{pause();change(()=>state=create(state.level+1));$('step').focus();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);render();
