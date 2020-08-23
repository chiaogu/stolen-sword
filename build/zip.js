import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import filesize from 'filesize';

const zip = () => ({
  generateBundle(output, bundle) {
    const zipPath = path.join(__dirname, '..', 'dist', 'index.zip');
    const { source } = bundle['index.html'];
    const zip = new AdmZip();
    zip.addFile('index.html', source);
    zip.writeZip(zipPath);
    execFile(path.join(__dirname, 'ect'), ['-8', '-zip', zipPath], (err, stdout, stderr) => {
      console.log(err ? stderr : stdout);
      console.log('File size:', filesize(fs.statSync(zipPath).size));
    });
  }
});

export default zip;