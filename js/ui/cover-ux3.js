// =====================================================================================
//  CD Cover Studio — phone layout round 3
//  · one compact top row (Back / Exit are icons on phones, so Thai labels never push the bar to two lines)
//  · the random tools and Copy CD Cover sit at the top, right under the toolbar
//  · the cover takes a little less height, so the tools and settings come up
//  · Position & size / Pose & expression / … look like buttons that open, and stay open while you adjust them;
//    the settings panel keeps its scroll position (e.g. adding a member does not jump to the top)
// =====================================================================================
const CV3_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
ui.cvDet=ui.cvDet||{};
function cvDetT(el){try{const k=el.getAttribute('data-k');if(k)ui.cvDet[k]=el.open}catch(e){}}
function cv3Tools(){const EL=typeof EDS!='undefined'?EDS:[],rc=typeof RCCV!='undefined'&&RCCV;let h='';
 if(typeof cvRandMem=='function')h+=`<button class="cvchip" onclick="cvRandMem()">🎲 ${CV3_T('Members','สมาชิก')}</button><button class="cvchip" onclick="cvRandPos()">🎲 ${CV3_T('Positions','ตำแหน่ง')}</button><button class="cvchip" onclick="cvRandPose()">🎲 ${CV3_T('Poses','ท่าทาง')}</button><button class="cvchip" onclick="cvRandText()">🎲 ${CV3_T('Texts','ข้อความ')}</button>`;
 if(!rc&&EL.length>1){const others=EL.filter(e=>e!=ui.ed);h+=`<span class="cv3sep"></span><select class="cv3sel" onchange="if(this.value){copyCover('${String(ui.ed).replace(/'/g,"\\'")}',this.value);this.value=''}"><option value="">${CV3_T('Copy this cover to…','คัดลอกปกนี้ไปที่…')}</option>${others.map(e=>`<option value="${esc(e)}">${esc(e)}</option>`).join('')}</select>`}
 return h?`<div class="cv3tools">${h}</div>`:''}
{const f=V.cover;V.cover=function(){let h=f.apply(this,arguments);try{if(!h.includes('class="cvtop"'))return h;
  // the tools at the top (removed from the Cover tools box below)
  const t=cv3Tools();if(t){const i=h.indexOf('<div class="cvtop">'),j=i>=0?h.indexOf('</div>',i):-1;if(j>0)h=h.slice(0,j)+t+h.slice(j)}
  h=h.replace(/<div class="cvchips"><button class="cvchip" onclick="cvRandMem\(\)">[\s\S]*?<\/div>/,'');
  h=h.replace(/<div class="cvchips"><span class="st">Copy CD cover:<\/span>[\s\S]*?<\/div>/,'');
  // expandable sections: clear, and they keep their open state
  h=h.replace(/<details class="cvdet"([^>]*)><summary>([^<]*)<\/summary>/g,(m0,attr,sum)=>{const k=sum.trim(),st=ui.cvDet[k];let a=attr.replace(/\sopen(?=[\s>]|$)/,'');const open=st==null?/\bopen\b/.test(attr):st;return`<details class="cvdet" data-k="${esc(k)}" ontoggle="cvDetT(this)"${open?' open':''}${a}><summary><span>${sum}</span><i class="cv3chev" aria-hidden="true"></i></summary>`})}catch(e){console.error(e)}return h}}
// a little more room for the tools under the cover on phones
{const f=cvmLayout;cvmLayout=function(){f.apply(this,arguments);try{const x=document.querySelector('.cvx.cvmob');if(!x)return;const v=parseFloat(x.style.getPropertyValue('--cvmain'));if(!v)return;const mainH=Math.max(150,Math.round(v*.84));x.style.setProperty('--cvmain',mainH+'px');
  const st=document.getElementById('cvstage'),act=x.querySelector('.cvact'),aH=act?act.offsetHeight:0,W=x.clientWidth;if(st&&typeof CVH!='undefined'){const sh=mainH-aH-4,fitW=Math.min(W-16,(sh-16)*512/CVH),pad=Math.max(8,(W-fitW)/2);st.style.paddingLeft=pad+'px';st.style.paddingRight=pad+'px'}try{cvOverlay()}catch(e){}}catch(e){}}}
// the settings panel keeps its scroll position across redraws
{const f=render;render=function(){let y=null,w=null;try{if(view=='cover'){const p=document.querySelector('.cvpanel');if(p)y=p.scrollTop;const d=document.querySelector('.cvdrawer');if(d)w=d.scrollTop}}catch(e){}const r=f.apply(this,arguments);
 try{if(view=='cover'){const p=document.querySelector('.cvpanel');if(p&&y!=null)p.scrollTop=y;const d=document.querySelector('.cvdrawer');if(d&&w!=null)d.scrollTop=w}}catch(e){}return r}}
try{Object.assign(I18N_TH,{'Position & size':'ตำแหน่งและขนาด','Members':'สมาชิก','Positions':'ตำแหน่ง','Poses':'ท่าทาง','Texts':'ข้อความ'})}catch(e){}
