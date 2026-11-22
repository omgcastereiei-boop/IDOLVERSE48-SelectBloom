// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Senbatsu screen: the other songs of this single
// -------------------------------------------------------------------------------------
//  · "Only members not yet in any other song of this single" works for every song of the single
//    (Title Track and every coupling song, also before it is put on a CD type).
//  · Each member card shows the songs of this single she is already in.
//  · Auto Select can skip members who are already in another song of this single.
// =====================================================================================
function soTracks(p){if(!p)return[];return[...new Set([p.mainId,...(p.coup||[]),...((p.types||[]).flatMap(t=>t.songs||[]))].filter(i=>i&&S.songs[i]))]}
function soUsed(o){const p=S.pj,M=new Map();if(!p||!o)return M;const T=soTracks(p);if(!T.includes(o.id))return M;
 T.filter(i=>i!=o.id).forEach(i=>{const s=S.songs[i];((s&&s.fm&&s.fm.sl)||[]).forEach(z=>{if(z.m!=null){if(!M.has(z.m))M.set(z.m,[]);M.get(z.m).push((i==p.mainId?'★ ':'')+s.title)}})});return M}
{const f=selUI;selUI=function(){let h=f.apply(this,arguments);try{const o=S.songs[ui.es],fl=ui.sf=ui.sf||{},U=soUsed(o);if(!U.size&&!(S.pj&&soTracks(S.pj).includes(o&&o.id)))return h;
  if(!/ui\.sf\.nf=/.test(h))h=h.replace(/<button class="b s" onclick="ui\.sf=\{\};render\(\)">/,m=>`<label class="plnm"><input type="checkbox" ${fl.nf?'checked':''} onchange="ui.sf.nf=this.checked?1:0;render()"> Only members not yet in any other song of this single</label>`+m);
  h=h.replace(/ <span class="tag plin">in another song<\/span>/g,'');let hid=0;
  h=h.replace(/(<div class="c m)("[^>]*draggable="true" ondragstart="event\.dataTransfer\.setData\('text\/plain','m:(\d+)'\)")/g,(a,c,rest,id)=>{if(fl.nf&&U.has(+id)&&!/slhide/.test(c)){hid++;return c+' slhide'+rest}return a});
  h=h.replace(/(onclick="fmAssign\((\d+)\)">[\s\S]*?<div class="st"><b>[^<]*<\/b>)/g,(a,b,id)=>{const L=U.get(+id);return L?b+` <span class="tag plin">♪ ${L.map(esc).join(' · ')}</span>`:b});
  if(fl.nf&&hid&&!/already in another song of this single are hidden/.test(h))h=h.replace(' shown',` shown · ${hid} member(s) already in another song of this single are hidden`)}catch(e){console.error(e)}return h}}
// ---- Auto Select: skip members already in another song of this single ------------------------------------------------------------------
{const f=autoPanel;autoPanel=function(o,dis){let h=f.apply(this,arguments);try{if(!(S.pj&&soTracks(S.pj).includes(o.id))||soTracks(S.pj).length<2)return h;const a=ui.aa||{};
  h=h.replace('<h3>Auto Select</h3>',`<h3>Auto Select</h3><label class="plnm"><input type="checkbox" ${dis||''} ${a.nf?'checked':''} onchange="ui.aa=ui.aa||{};ui.aa.nf=this.checked?1:0;render()"> Only members not yet in any other song of this single</label>`)}catch(e){console.error(e)}return h}}
function soWithout(fn){const o=S.songs[ui.es],U=soUsed(o);if(!(ui.aa&&ui.aa.nf)||!U.size)return fn();const e0=gsElig;gsElig=function(){return e0.apply(this,arguments).filter(m=>!U.has(m.id))};try{return fn()}finally{gsElig=e0}}
{const f=autoAdv;autoAdv=function(){const a=arguments,t=this;return soWithout(()=>f.apply(t,a))}}
if(typeof genAuto=='function'){const f=genAuto;genAuto=function(){const a=arguments,t=this;return soWithout(()=>f.apply(t,a))}}
