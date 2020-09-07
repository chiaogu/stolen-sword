import { minify as htmlMinify } from 'html-minifier-terser';

const template = script => `
<html lang="en">
  <head>
    <title>Untitled</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"/>
  </head>
  <body style="display:flex;justify-content:center;align-items:center;margin:0;background:#000;overflow:hidden;user-select: none;pointer-events: none;">
    <canvas></canvas>
    ${script}
  </body>
</html>
`;

const html = isProduction => ({
  generateBundle(output, bundle) {
    const { fileName, code } = bundle[Object.keys(bundle)[0]];
    let source;
    if(isProduction) {
      source = htmlMinify(template(`<script>${code}</script>`), {
        collapseWhitespace: true
      });
    } else {
      source = template(`<script src="./${fileName}"></script>`);
    }
    this.emitFile({ type: 'asset', fileName: 'index.html', source });
  }
});

export default html;