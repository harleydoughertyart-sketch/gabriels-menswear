import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Publish only the assembled pages and their referenced files, never the workspace.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'dist');
if(path.dirname(output)!==root||path.basename(output)!=='dist')throw new Error('Unsafe output directory');
const pages=['index.html','tailoring.html','weddings.html','prom.html','book.html','privacy.html','cookies.html','terms.html'];
const queue=[...pages,'favicon.ico','robots.txt','sitemap.xml','llms.txt'];
const files=new Map(),missing=[];
const textTypes=new Set(['.html','.css','.js','.svg','.xml','.txt']);
function addReference(raw,from){
 let ref=raw.replaceAll('&amp;','&').split(/[?#]/)[0];
 if(!ref||ref.startsWith('//')||/^(?:data:|https?:|mailto:|tel:|javascript:|#)/i.test(ref))return;
 if(ref.includes('${')||ref.includes('*')||ref.includes('<')||ref.includes('>'))return;
 let relative=ref.startsWith('/')?ref.slice(1):path.posix.normalize(path.posix.join(path.posix.dirname(from),ref));
 if(relative.startsWith('../'))throw new Error('Reference outside project: '+relative);
 if(!path.posix.extname(relative))return;
 if(!/\.(?:html|css|js|svg|ico|png|jpe?g|webp|avif|mp4|webm|woff2?|ttf|json)$/i.test(relative))return;
 if(relative.startsWith('assets/')||pages.includes(relative)||['scrollcraft.css','scrollcraft.js','styles.css','script.js','favicon.ico'].includes(relative))queue.push(relative);
}
while(queue.length){
 const relative=queue.shift();if(files.has(relative))continue;
 let buffer;try{buffer=await fs.readFile(path.join(root,relative));}catch{missing.push(relative);continue;}
 files.set(relative,buffer);
 if(!textTypes.has(path.extname(relative)))continue;
 const text=buffer.toString('utf8');
 if(/formsubmit\.co\/(?:ajax\/)?[^\s"'<>/]+@/i.test(text))throw new Error('Use an activated opaque FormSubmit token, not a recipient email endpoint: '+relative);
 for(const match of text.matchAll(/https:\/\/gabrielsmenswear\.com(\/assets\/[^"'`\s<>]+?\.(?:svg|ico|png|jpe?g|webp|avif|mp4|webm))/g))addReference(match[1],relative);
 // HTML attributes/srcsets and quoted JS asset constants.
 for(const match of text.matchAll(/(?:["'`])((?:\/?assets\/|\/?scrollcraft\.|\/?styles\.|\/?script\.|\/?favicon\.)[^"'`\s<>]*?\.(?:css|js|svg|ico|png|jpe?g|webp|avif|mp4|webm|woff2?|ttf|json))(?:[?#][^"'`\s<>]*)?(?=["'`\s,])/g)){
  const asset=match[1];addReference(asset.startsWith('assets/')?'/'+asset:asset,relative);
 }
 for(const match of text.matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/g))addReference(match[1],relative);
 for(const match of text.matchAll(/(?:src|href|poster|data-src|data-src-mobile|data-poster|data-poster-mobile)=["']([^"']+)["']/g))addReference(match[1],relative);
 for(const match of text.matchAll(/srcset=["']([^"']+)["']/g))for(const part of match[1].split(','))addReference(part.trim().split(/\s+/)[0],relative);
}
if(missing.length)throw new Error('Missing public files: '+[...new Set(missing)].join(', '));
// Check all JSON-LD parses and public page links before writing any output.
for(const page of pages){const html=files.get(page).toString('utf8');
 for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g))JSON.parse(m[1]);
 if((html.match(/<h1\b/g)||[]).length!==1)throw new Error(page+' must have one h1');
 for(const m of html.matchAll(/href=["'](\/[^"']*)["']/g)){const route=m[1].split(/[?#]/)[0];if(route.startsWith('//')||route.startsWith('/assets/'))continue;const target=route==='/'?'index.html':route.slice(1)+(path.extname(route)?'':'.html');if(!files.has(target))throw new Error(page+' broken route '+route);}
}
// Inline each page's own stylesheets. Each is a few KB, but as separate files every
// one held first paint for another round trip on a phone. None uses relative url().
function inlineStyles(html,page){
 return html.replace(/<link rel="stylesheet" href="([^"]+\.css)"\s*\/?>/g,(tag,href)=>{
  if(/^(?:[a-z]+:)?\/\//i.test(href))return tag;
  const css=files.get(href.replace(/^\//,''));
  if(!css)throw new Error(page+' missing stylesheet '+href);
  const text=css.toString('utf8');
  if(/<\/style|url\(\s*(?!["']?(?:data:|#|%23|\/|https?:))/i.test(text))throw new Error(href+' cannot be inlined as is');
  return '<style>'+text+'</style>';
 });
}
// Exact checked output path is the only tree replaced.
await fs.rm(output,{recursive:true,force:true});await fs.mkdir(output,{recursive:true});
for(const [relative,buffer]of files){const dest=path.join(output,relative);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,pages.includes(relative)?inlineStyles(buffer.toString('utf8'),relative):buffer);}
console.log('Built '+files.size+' public files; '+(Array.from(files.values()).reduce((n,b)=>n+b.length,0)/1048576).toFixed(1)+' MB. No workspace documents, raw source media, or secrets copied.');
