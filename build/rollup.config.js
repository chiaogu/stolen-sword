import { terser } from "rollup-plugin-terser";
import browsersync from 'rollup-plugin-browsersync';
import del from 'rollup-plugin-delete';
import html from './html';
import zip from './zip';

const isProduction = process.env.NODE_ENV === 'production';

export default ({ watch }) => ({
  input: "src/index.js",
  output: {
    file: "dist/bundle.js",
    format: "iife"
  },
  plugins: [
    del({ targets: 'dist/*' }),
    isProduction && terser({
      compress: {
        booleans_as_integers: true,
        module: true,
        ecma: '2015',
        unsafe_arrows: true
      },
      mangle: {
        toplevel: true
      },
      toplevel: true,
      
    }),
    html(isProduction),
    watch && browsersync({ server: "dist", open: false }),
    isProduction && zip()
  ]
});