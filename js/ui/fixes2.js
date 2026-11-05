// =====================================================================================
//  IDOLVERSE48: Select Bloom! — small gameplay fixes
//  · Default dance formation rows alternate odd / even (single Center) or even / odd (twin Centers)
//    so the Center(s) stand exactly in the middle: 12 → 3-4-5, 16 → 5-6-5, 24 → 7-8-9.
//    Used by every new / auto-generated formation and the Theater (saved formations unchanged).
//  · New Single Production songs start with a 16-member Senbatsu.
//  · Start Single starts directly (no extra "Please confirm" dialog; requirements and funds
//    are still checked by startSingle).
// =====================================================================================
// rows alternate parity so the Center(s) are always exactly in the middle and every row stands in
// the gaps of the row in front: single Center → odd, even, odd …; twin Centers → even, odd, even …
// (only the last row may break the pattern when the total makes it impossible). Rows grow gently to the back.
function fxRows(n,nc){n=Math.max(1,n|0);nc=Math.max(1,Math.min(nc|0||1,n));let R=n<=5?1:n<=10?2:n<=24?3:n<=34?4:5;R=Math.min(R,CFG.maxRows||5);if(R==1)return[n];
 const par=i=>((nc%2?0:1)+i)%2==0?1:0;let best=null,bs=1e9;const t=i=>n/R+(i-(R-1)/2)*.5;
 const rec=(i,left,acc,sc)=>{if(sc>=bs)return;if(i==R-1){if(left<1)return;const v=sc+(left-t(i))**2+(left%2!=par(i)?1.5:0)+(left<acc[i-1]?2:0);if(v<bs){bs=v;best=[...acc,left]}return}
  for(let x=1;x<=left-(R-1-i);x++){if(i==0&&x<nc)continue;rec(i+1,left-x,[...acc,x],sc+(x-t(i))**2+(x%2!=par(i)?100:0)+(i>0&&x<acc[i-1]?2:0)+(i==0&&n>=10&&x<3?2:0))}};
 rec(0,n,[],0);return best||[n]}
defForm=function(size,nc){return buildForm(fxRows(size,nc),Math.max(1,nc|0))};
confirmProd=function(){const p=S.pj;if(!p||p.status!='draft')return toast('This single has already started.','err');try{czSyncPlan()}catch(e){}startSingle()};
// new songs in Single Production start with a 16-member Senbatsu (or every eligible member when fewer)
{const f=mkSong;mkSong=function(role,x={}){const o=f.apply(this,arguments);try{if((role=='Main'||role=='Coupling')&&!x.th&&o.fm&&!(o.slots||[]).length){const n=Math.max(1,Math.min(16,elig(o).length||16));o.fm.size=n;o.fm.nc=1;o.fm.sl=genForm(n,1)}}catch(e){}return o}}
