import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import filesize from 'filesize';
import advzip from 'advzip-bin';
import JSZip from 'jszip';

const zip = () => ({
  generateBundle(output, bundle) {
    const zipPath = path.join(__dirname, '..', 'dist', 'index.zip');
    const { source } = bundle['index.html'];
    const zip = new JSZip();
    zip
      .file('index.html', source)
      .generateNodeStream({
        type:'nodebuffer',
        compression: "DEFLATE",
        compressionOptions: {
          level: 9
        }
      })
      .pipe(fs.createWriteStream(zipPath))
      .on('finish', function () {
        execFile(advzip, ['--recompress', '--shrink-extra', zipPath], err => {
          console.log(err ? err : 'ZIP file minified!', filesize(fs.statSync(zipPath).size));
          execFile(path.join(__dirname, 'ect'), ['-8', '-zip', zipPath], (err, stdout, stderr) => {
            console.log(err ? stderr : stdout);
            console.log(`File size: ${filesize(fs.statSync(zipPath).size)}\n`);
          });
        });
      });
  }
});

export default zip;