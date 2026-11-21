// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Concert results on the big screen
// -------------------------------------------------------------------------------------
//  After a concert performance the results are presented like the General Election
//  ceremony: a full-screen show, one step at a time (NEXT / BACK):
//   opening → every song of the setlist (stage picture, Center, members) and the MC/VTR
//   corners → ticket results → performance evaluation → fan response → member highlights
//   → fan growth → finish. "Full report" opens the detailed report (same as before).
//  The show can be replayed from any performance report (▶ Big screen).
// =====================================================================================
function ccShSteps(q){const St=[];(q||[]).forEach((x,qi)=>{const C=ccGet(x.c);if(!C)return;
 if(x.fin){if(C.fin&&C.fin.rev)St.push({k:'fin',qi,C});return}
 const p=C.pf.find(z=>z.id==x.p);if(!p||!p.res||p.res.err)return;const R=p.res,set=C.sets[R.sid]||R.set||{items:[]};
 St.push({k:'open',qi,C,p});let n=0;(set.items||[]).forEach((it,idx)=>{if(it.k=='song')St.push({k:'song',qi,C,p,set,it,idx,no:++n});else St.push({k:'corner',qi,C,p,it})});
 ['tix','eval','resp','mem','grow'].forEach(k=>St.push({k,qi,C,p}))});
 St.push({k:'end'});return St}
function ccShOpen(q,mod){const St=ccShSteps(q);if(St.length<2){if(mod){ui.mod=mod;render()}return}ui.ccsh={q,i:0,mod:mod||{t:'html',h:ccQHtml(q),cc:1,ccq:q}};ui.mod=null;render()}
function ccShGo(d){const s=ui.ccsh;if(!s)return;const n=ccShSteps(s.q).length;s.i=Math.max(0,Math.min(n-1,s.i+d));render()}
function ccShEnd(full){const s=ui.ccsh;ui.ccsh=null;if(full&&s&&s.mod)ui.mod=s.mod;render()}
function ccShReplay(cid,pid){const C=ccGet(cid),p=C&&C.pf.find(z=>z.id==pid);if(!p||!p.res)return;const keep=ui.mod;ccShOpen([{c:cid,p:pid}],keep&&keep.t=='html'?keep:null)}
const ccShK=(a,b,c)=>`<div class="ccshk"><small>${a}</small><b>${b}</b>${c?`<span>${c}</span>`:''}</div>`;
function ccShPor(C,id,sz){const m=ccMem(id);return m?ptc(m,sz):`<span class="ccshq">?</span>`}
function ccShHtml(){const s=ui.ccsh,St=ccShSteps(s.q),i=Math.min(s.i,St.length-1),z=St[i];s.i=i;const btn=(t,f,c='p')=>`<button class="geb ${c}" onclick="${f}">${t}</button>`;let body='',kick='';
 const C=z.C,p=z.p,R=p&&p.res,V=C&&ccV(C.vid);
 if(z.k=='open'){const ids=Object.keys(R.mem||{}).map(Number);body=`<div class="gestage op"><div class="gekicker">LIVE CONCERT · ${esc(S.co)}</div><h1 class="getitle">${esc(C.name)}</h1><div class="gesub">Performance ${p.no}</div><div class="geven">${V?esc(V.n):''} · ${jd(R.day)} · ${CC_SL[p.sl]||''}</div><div class="ccshkg">${ccShK('In the venue',R.phys.toLocaleString(),ccPct(R.cap?R.phys/R.cap:0))}${ccShK('Online',R.onl.toLocaleString())}${ccShK('Setlist',esc(R.setName||''),`${ccSongIt(C.sets[R.sid]||R.set||{items:[]}).length} songs`)}</div><div class="gecrowd">${ids.slice(0,60).map(id=>`<span>${ccShPor(C,id,44)}</span>`).join('')}</div></div>`}
 else if(z.k=='song'){const it=z.it,pos=(it.pos||[]).filter(x=>x.m!=null),cen=pos.filter(x=>x.c).map(x=>ccNm(C,x.m));let pic='';try{pic=ccStageSvg(C,p,z.set,z.idx)}catch(e){console.error(e)}
  body=`<div class="gestage"><div class="gekicker">M${z.no}</div><h2 class="ccshtt">${esc(it.title)}</h2><div class="ccshpic">${pic}</div><p class="gecap">${cen.length?`<span>Center</span> <b>${cen.map(esc).join(' &amp; ')}</b> · `:''}${pos.length} member(s)${R.out&&pos.some(x=>R.out[x.m])?` · <span class="ccneg">absent: ${pos.filter(x=>R.out[x.m]).map(x=>esc(ccNm(C,x.m))).join(', ')}</span>`:''}</p></div>`}
 else if(z.k=='corner'){const it=z.it;body=`<div class="gestage op"><div class="gekicker">${it.k=='mc'?'MC CORNER':esc(String(it.k).toUpperCase())}</div><h1 class="getitle ccshsm">${esc(it.name||'')}</h1>${it.about?`<p class="gemc">${esc(it.about)}</p>`:''}${(it.mem||it.members||[]).length?`<div class="gecrowd">${(it.mem||it.members).map(id=>`<span>${ccShPor(C,id,52)}</span>`).join('')}</div>`:''}</div>`}
 else if(z.k=='tix'){const tk=[...Object.keys(CC_TIX).filter(k=>p.tix[k]&&p.tix[k].on).map(k=>[CC_TIX[k],R.sold[k]|0,p.tix[k].qty,(R.sold[k]|0)*p.tix[k].price]),...Object.keys(CC_OTIX).filter(k=>p.on&&p.on[k]&&p.on[k].on).map(k=>[CC_OTIX[k],R.sold[k]|0,null,(R.sold[k]|0)*p.on[k].price])];
  body=`<div class="gestage"><div class="gekicker">Ticket results</div><h2 class="ccshtt">${yen(R.revP+R.revO)}</h2><div class="ccshtab">${tk.map(([n,a,b,r])=>`<div><span>${n}</span><b>${a.toLocaleString()}${b!=null?' / '+b.toLocaleString():''}</b><i>${yen(r)}</i></div>`).join('')}</div></div>`}
 else if(z.k=='eval')body=`<div class="gestage"><div class="gekicker">Performance evaluation</div><div class="ccshkg big">${ccShK('Vocal Performance',R.vocal)}${ccShK('Dance Performance',R.dance)}${ccShK('Passion & Stage Presence',R.pas)}${ccShK('Performance Efficiency',R.eff)}${ccShK('Mistakes',R.mistakes)}</div></div>`;
 else if(z.k=='resp'){const A=(R.resp||{}).all||{};body=`<div class="gestage"><div class="gekicker">Fan response</div><h2 class="ccshtt">Overall satisfaction ${A.all??'—'}</h2><div class="ccshkg big">${ccShK('Song Satisfaction',A.song??'—')}${ccShK('Member Satisfaction',A.mem??'—')}${ccShK('Position Satisfaction',A.pos??'—')}${ccShK('Physical audience',A.ph??'—')}${ccShK('Online audience',A.on??'—')}</div>${(R.neg||[]).length?`<div class="ccshneg">${R.neg.slice(0,4).map(n=>`<p>💬 ${esc(n)}</p>`).join('')}</div>`:''}</div>`}
 else if(z.k=='mem'){const G=(R.growth||{}).mem||{},L=Object.entries(R.mem||{}).filter(([,r])=>r.songs||r.mc).map(([id,r])=>{const g=G[id]||{};return{id:+id,r,g,score:(g.kg||0)*3+(g.og||0)+(g.cas||0)}}).sort((a,b)=>b.score-a.score||(b.r.center-a.r.center)||(b.r.songs-a.r.songs)).slice(0,8);
  body=`<div class="gestage"><div class="gekicker">Member highlights</div><div class="ccshmem">${L.map((x,k)=>`<div class="${k==0?'top':''}">${ccShPor(C,x.id,k==0?92:64)}<b>${esc(ccNm(C,x.id))}</b><small>${x.r.songs} song(s)${x.r.center?` · Center ×${x.r.center}`:''}</small><span>${x.g.kg?`+${x.g.kg} Kami Oshi `:''}${x.g.og?`+${x.g.og} Oshi `:''}${x.g.cas?`+${x.g.cas} <span>new fans</span>`:''}${!x.g.kg&&!x.g.og&&!x.g.cas?'—':''}</span></div>`).join('')}</div></div>`}
 else if(z.k=='grow'){const G=R.growth||{};body=`<div class="gestage"><div class="gekicker">Fan growth</div><div class="ccshkg big">${ccShK('New Casual Fans',(G.newCas||0).toLocaleString())}${ccShK('New Regular Fans',(G.newReg||0).toLocaleString())}${ccShK('New Oshi',(G.newOshi||0).toLocaleString())}${ccShK('New Kami Oshi',(G.newKami||0).toLocaleString())}${ccShK('Kami Oshi changes',(G.kch||0).toLocaleString())}${ccShK('Fans lost',(G.lost||0).toLocaleString())}</div></div>`}
 else if(z.k=='fin')body=`<div class="gestage"><div class="gekicker">Concert complete</div><div class="ccshcard">${ccFinHtml(C,true)}</div></div>`;
 else body=`<div class="gestage op"><div class="gekicker">Thank you!</div><h1 class="getitle">END</h1><p class="gemc">Open the full report for every number, table and the setlist picture viewer.</p></div>`;
 const last=i==St.length-1,prog=Math.round(100*i/Math.max(1,St.length-1)),title=C?`${C.name}${p?' · Performance '+p.no:''}`:'Concert';
 const act=(i>0?btn('BACK','ccShGo(-1)','s'):'')+(last?btn('FULL REPORT','ccShEnd(1)','p gold')+btn('CLOSE','ccShEnd(0)','s'):btn('NEXT','ccShGo(1)'));
 return`<div class="gecer ccsh" role="dialog" aria-label="${esc(title)}"><div class="gebg"><i></i><i></i><i></i><i></i></div><div class="getop"><div><b>${esc(title)}</b><span>${V?esc(V.n):''}</span></div><div class="geprog"><i style="width:${prog}%"></i></div><div class="getopb">${last?'':btn('SKIP','ccShEnd(1)','s')}</div></div><div class="gebody" data-step="${i}">${body}</div><div class="geact">${act}</div></div>`}
// the pop-up after performances becomes the big-screen show
{const f=ccDaily;ccDaily=function(){const before=ui.mod;const r=f.apply(this,arguments);try{if(ui.mod&&ui.mod!==before&&ui.mod.ccq)ccShOpen(ui.mod.ccq,ui.mod)}catch(e){console.error(e)}return r}}
// replay from a performance report
{const f=ccRepHtml;ccRepHtml=function(C,p){const h=f.apply(this,arguments);try{if(p&&p.res&&!p.res.err)return h.replace(/(<h2 class="ht">🎤[^<]*<\/h2>)/,`$1<div class="row"><button class="b s p" onclick="ccShReplay('${C.id}','${p.id}')">▶ Big screen</button></div>`)}catch(e){}return h}}
{const f=render;render=function(){const r=f.apply(this,arguments);try{const old=document.getElementById('ccshw');if(S&&!ui.t&&ui.ccsh){const a=document.getElementById('app'),d=old||document.createElement('div');d.id='ccshw';d.innerHTML=ccShHtml();if(!old&&a)a.appendChild(d);document.body.classList.add('gecer-on')}else if(old){old.remove();if(!document.getElementById('gecerw'))document.body.classList.remove('gecer-on')}}catch(x){console.error(x)}return r}}
