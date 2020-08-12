import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import advzip from 'advzip-bin';
import filesize from 'filesize';

const zip = () => ({
  generateBundle(output, bundle) {
    const zipPath = path.join(__dirname, '..', 'dist', 'index.zip');
    const { source } = bundle['index.html'];
    const zip = new AdmZip();
    zip.addFile('index.html', source);
    zip.writeZip(zipPath);
    execFile(advzip, ['--recompress', '--shrink-extra', zipPath], err => {
      console.log(err ? err : 'ZIP file minified!', filesize(fs.statSync(zipPath).size));
    });
  }
});

export default zip;