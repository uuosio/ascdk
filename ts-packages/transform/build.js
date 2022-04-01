import esbuild from 'esbuild'

// Automatically exclude all node_modules from the bundled version
// const { nodeExternalsPlugin } = require('esbuild-node-externals')

esbuild.build({
  entryPoints: ['./bin/eosio-asc.ts'],
  outfile: './bin/eosio-asc.js',
  bundle: false,
  minify: false,
  platform: 'node', //node
  sourcemap: false,
  target: 'node16',
  tsconfig: "./tsconfig.json",

  // external: ["path", "process", "fs", "assemblyscript/*"],
  
  format: 'cjs'
}).catch(() => process.exit(1))