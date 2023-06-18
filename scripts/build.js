const { build } = require('esbuild')
const path = require('path')
// const { dependencies, peerDependencies } = require('./package.json')

const sharedConfig = {
    bundle: true,
    minify: true
    // external: Object.keys(dependencies).concat(Object.keys(peerDependencies))
}

const entries = {
    backend: path.resolve(__dirname, '../packages/backend/index.ts'),
    spot: path.resolve(__dirname, '../packages/spot/index.ts'),
    lambda: path.resolve(__dirname, '../packages/lambda/index.ts')
}

Object.entries(entries).map((value) => {
    const [name, path] = value

    build({
        ...sharedConfig,
        entryPoints: [path],
        platform: 'node', // for CJS
        outfile: `dist/${name}.bundle.js`,
        sourcemap: true
    })
})
