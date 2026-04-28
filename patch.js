import fs from 'fs';
import path from 'path';

const dir = 'apps/pocketbase/pb_migrations';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && !f.endsWith('.disabled'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // replace migrate((app) => with migrate((db) => { const app = new Dao(db);
  content = content.replace(/migrate\(\(app\)\s*=>\s*\{/g, 'migrate((db) => {\n  const app = new Dao(db);\n  // patch \n  app.save = function(m) { if (m instanceof Collection) return app.saveCollection(m); return app.saveRecord(m); };\n  app.delete = function(m) { if (m instanceof Collection) return app.deleteCollection(m); return app.deleteRecord(m); };');
  
  fs.writeFileSync(path.join(dir, file), content);
}
console.log("Patched " + files.length + " files");
