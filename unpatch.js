import fs from 'fs';
import path from 'path';

const dir = 'apps/pocketbase/pb_migrations';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  content = content.replace(/migrate\(\(db\)\s*=>\s*\{\s*const app = new Dao\(db\);[\s\S]*?app\.deleteRecord\(m\);\s*\};/m, 'migrate((app) => {');
  
  fs.writeFileSync(path.join(dir, file), content);
}
console.log("Unpatched " + files.length + " files");
