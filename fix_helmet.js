import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('apps/web/src', (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("from 'react-helmet'")) {
      console.log('Fixing ' + filePath);
      content = content.replace("from 'react-helmet'", "from 'react-helmet-async'");
      fs.writeFileSync(filePath, content);
    }
  }
});
