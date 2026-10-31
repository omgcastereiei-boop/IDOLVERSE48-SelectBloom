// Zero-dependency static server: node tools/serve.js [port]  →  http://localhost:8048
const http=require('http'),fs=require('fs'),path=require('path'),root=path.join(__dirname,'..'),port=+process.argv[2]||+process.env.PORT||8048;
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(root,path.normalize(p).replace(/^(\.\.[\/\\])+/,''));
 if(!f.startsWith(root))return r.writeHead(403).end();fs.readFile(f,(e,d)=>{if(e)return r.writeHead(404).end('Not found');r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(port,()=>console.log(`IDOLVERSE48 running at http://localhost:${port}`));
