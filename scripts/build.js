const { build } = require('esbuild')
const path = require('path')
const inlineImportPlugin = require('esbuild-plugin-inline-import')

// const { dependencies, peerDependencies } = require('./package.json')

const sharedConfig = {
    bundle: true,
    minify: true
    // external: Object.keys(dependencies).concat(Object.keys(peerDependencies))
}

const entries = {
    backend: path.resolve(__dirname, '../packages/backend/index.ts'),
    spot: path.resolve(__dirname, '../packages/spot/index.ts'),
    lambda: path.resolve(__dirname, '../packages/lambda/index.ts'),
    cron: path.resolve(__dirname, '../packages/cron/index.ts'),
    scheduler: path.resolve(__dirname, '../packages/scheduler/index.ts')
}

Object.entries(entries).map((value) => {
    const [name, path] = value

    build({
        ...sharedConfig,
        entryPoints: [path],
        platform: 'node', // for CJS
        target: 'esnext',
        tsconfig: './tsconfig.json',
        outfile: `dist/${name}.bundle.js`,
        sourcemap: true,
        plugins: [
            inlineImportPlugin({
                filter: /^inline:/,
                namespace: '_' + Math.random().toString(36).substr(2, 9),
                transform: async (contents, args) => contents
            })
        ],
        loader: { '.node': 'file' }
    })
})
