// =====================================================================================
//  IDOLVERSE48: Select Bloom! — smaller Theater history (lighter saves, faster days)
// -------------------------------------------------------------------------------------
//  Theater performance records older than 30 days keep their summary (date, Stage, Setlist, members,
//  audience, satisfaction, revenue, special stage) but drop the per-song / per-member detail tables.
//  Kept in full: the FIRST and the LAST performance of every Stage, every Birthday Stage and every
//  Graduation Stage (and anything newer than 30 days). Runs when a save is loaded and once a month.
// =====================================================================================
const THC_DAYS=30,THC_AUD=['mfs','mfItems','mfSrc','mfMcQ','mfExp','mem','done','mfQ','mfBt'],THC_PF=['prefN','subs'];
function thcKeep(T){const keep=new Set(),first={},last={};(T.pf||[]).forEach(p=>{if(!p||!p.st)return;if(!first[p.st]||p.day<first[p.st].day)first[p.st]=p;if(!last[p.st]||p.day>=last[p.st].day)last[p.st]=p});
 Object.values(first).forEach(p=>keep.add(p.id));Object.entries(last).forEach(([sid,p])=>{const s=T.st&&T.st[sid];if(!s||s.status!='active')keep.add(p.id)});
 (T.pf||[]).forEach(p=>{if(p.sp||(T.st&&T.st[p.st]&&T.st[p.st].gst))keep.add(p.id)});return keep}
function thcRun(){let n=0;try{(S.groups||[{id:null}]).forEach(g=>{const run=()=>{const T=S.th;if(!T||!Array.isArray(T.pf))return;const keep=thcKeep(T);
  T.pf.forEach(p=>{if(!p||p.cmp||keep.has(p.id)||p.day==null||S.day-p.day<=THC_DAYS)return;const a=p.aud;if(a&&typeof a=='object')THC_AUD.forEach(k=>delete a[k]);THC_PF.forEach(k=>delete p[k]);p.cmp=1;n++})};
  if(g.id!=null&&typeof gsWith=='function')gsWith(g.id,run);else run()})}catch(e){console.error('thcRun',e)}return n}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{thcRun()}catch(e){console.error(e)}return r}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(dt().getDate()==1)thcRun()}catch(e){console.error(e)}return r}}
// Roadshow popularity per prefecture / country is a percentage: older saves above 100% are brought back to 100%
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{const fix=()=>{const L=S&&S.rs&&S.rs.loc;if(L)Object.values(L).forEach(c=>{if(c&&c.g>100)c.g=100})};fix();(S.groups||[]).forEach(g=>{try{gsWith(g.id,fix)}catch(e){}})}catch(e){console.error(e)}return r}}
