// Builds dist/IDOLVERSE48_Select_Bloom.html — the whole game inlined into ONE file
// (same as the original distribution format). Usage: node tools/build.js
const fs=require('fs'),path=require('path'),root=path.join(__dirname,'..');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,f)=>`<style>\n${fs.readFileSync(path.join(root,f),'utf8')}\n</style>`);
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,f)=>`<script>\n${fs.readFileSync(path.join(root,f),'utf8').replace(/<\/script/gi,'<\\/script')}\n</script>`);
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
const out=path.join(root,'dist','IDOLVERSE48_Select_Bloom.html');fs.writeFileSync(out,html);
console.log('Built',path.relative(root,out),(html.length/1024).toFixed(0)+' KB');
