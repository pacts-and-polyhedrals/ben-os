import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
await rm(dist,{recursive:true,force:true});
await cp(path.join(root,'site'),dist,{recursive:true});
await mkdir(path.join(dist,'data'),{recursive:true});
for(const file of ['charter.json','launch-actions.json','roles.json','creative-curriculum.json','roadmap-modules.json','module-delivery-status.json']){
 const data=JSON.parse(await readFile(path.join(root,'config',file),'utf8'));
 if(file==='launch-actions.json')delete data.source;
 if(file==='charter.json')delete data.source;
 await writeFile(path.join(dist,'data',file),JSON.stringify(data,null,2)+'\n');
}
console.log('Built static BEN dashboard in dist/ (no private source URLs or casework data).');
