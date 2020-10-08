const fs = require('fs');
const path = require('path');
const filesize = require('filesize');
const zipPath = path.join(__dirname, '..', 'dist', 'index.zip');
const fileSize = filesize(fs.statSync(zipPath).size);
const msgFile = process.env.HUSKY_GIT_PARAMS;
const message = fs.readFileSync(msgFile, { encoding: 'utf-8' });
fs.writeFileSync(msgFile, `[${fileSize}] ${message}`, { encoding: 'utf-8' });