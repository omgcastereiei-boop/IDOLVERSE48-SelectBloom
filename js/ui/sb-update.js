// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Single / Album formation & member history update
// -------------------------------------------------------------------------------------
//  · A song may have no Center: "No Center" in the Centers selector (fm.nc = 0, no center slot in Row 1).
//  · Member history: 1 member → (Solo) · 2 members → (Duet with <name>) · double Center → Center (Duet with <name>)
//    · 3+ Centers → Center (1 in N Centers). The same Duet label for 2-member unit songs of theater stages / concerts.
// =====================================================================================
const SBU_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
// ---- No Center ------------------------------------------------------------------------------------------------------------------
{const f=setNc;setNc=function(n){if(+n!==0)return f.apply(this,arguments);const o=cur(),F=o&&o.fm;if(!F)return;if(lockedSong(o.id))return toast('Production is already confirmed.','err');if(F.nc===0)return;
 const R=isDef(F)?defRows(F.size,0):rowsOf(F.sl);applyReshape(o,R,0,SBU_T('No Center: every member stands in the formation without a Center position.','ไม่มีเซ็นเตอร์: ทุกคนยืนในฟอร์เมชันโดยไม่มีตำแหน่งเซ็นเตอร์'))}}
{const f=fmCheck;fmCheck=function(o){const r=f.apply(this,arguments);try{if(o&&o.fm&&o.fm.nc===0)return r.filter(x=>x!='Invalid number of centers.'&&x!='Center slots do not match the center count.'||o.fm.sl.some(z=>z.c))}catch(e){}return r}}
// the Centers selector gets a "No Center" choice (shown first; selected when the song has none)
{const f=chrome;chrome=function(inner){try{if(typeof inner=='string'&&inner.includes('onchange="setNc(this.value)">')){const o=typeof cur=='function'?cur():null,nc=o&&o.fm?o.fm.nc:1;
  inner=inner.split('onchange="setNc(this.value)">').join(`onchange="setNc(this.value)"><option value="0" ${nc===0?'selected':''}>No Center</option>`);
  if(nc===0)inner=inner.replace(/· Centers 0 \(max (\d+)\)/,'· No Center (max $1)').replace(/ · 0\/0 centers filled/,'')}}catch(e){}return f.call(this,inner)}}
// ---- labels for the member history ----------------------------------------------------------------------------------------------
const SBU_SC=new Map();
function sbuSong(gid,sid){const k=gid+':'+sid+':'+(S&&S.day);if(SBU_SC.has(k))return SBU_SC.get(k);let o=null;try{o=gsWith(gid,()=>{const x=S.songs[sid];return x?{slots:(x.slots||[]).filter(Boolean),cen:(x.centers&&x.centers.length?x.centers:(x.center!=null?[x.center]:[])).filter(v=>v!=null)}:null})}catch(e){}if(SBU_SC.size>4000)SBU_SC.clear();SBU_SC.set(k,o);return o}
const sbuNm=id=>{const m=get(id)||(S.alumni||[]).find(x=>x.id==id);return m?m.name:''};
// {cen:true|false, tag:'(Solo)'|'(Duet with X)'|'(1 in 3 Centers)'|''}
function sbuTag(mid,ids,cens){ids=(ids||[]).filter(v=>v!=null);cens=(cens||[]).filter(v=>v!=null);const n=ids.length;
 if(n==1)return{cen:false,tag:'(Solo)'};if(n==2){const o=ids.find(x=>x!=mid);return{cen:false,tag:`(Duet with ${sbuNm(o)})`}}
 if(!cens.includes(mid))return{cen:false,tag:''};if(cens.length==2){const o=cens.find(x=>x!=mid);return{cen:true,tag:`(Duet with ${sbuNm(o)})`}}if(cens.length>=3)return{cen:true,tag:`(1 in ${cens.length} Centers)`};return{cen:true,tag:''}}
function sbuHistTag(m,h){const gid=h.gid!=null?h.gid:m.group,o=sbuSong(gid,h.song);if(!o)return h.center?{cen:true,tag:''}:h.pt=='solo'?{cen:false,tag:'(Solo)'}:h.pt=='duet'?{cen:false,tag:'(Duet)'}:{cen:false,tag:''};return sbuTag(m.id,o.slots,o.cen)}
// stage / concert unit songs: 2 members → Duet with <name>
if(typeof f10Tag=='function'){f10Tag=function(n,cen,ids,mid){if(n==1)return'Solo';if(n==2&&ids&&mid!=null){const o=ids.find(x=>x!=mid);return`Duet with ${sbuNm(o)}`}return n==2?'Duet':cen?'Center':''}}
try{if(typeof I18N_TH!='undefined'&&I18N_TH['No Center']==null)I18N_TH['No Center']='ไม่มีเซ็นเตอร์';if(typeof I18N_TH!='undefined'&&I18N_TH['No Center (max {0})']==null)I18N_TH_TPL.push(['· No Center (max {0})','· ไม่มีเซ็นเตอร์ (สูงสุด {0})'])}catch(e){}
