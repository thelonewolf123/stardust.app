const path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: {
        backend: path.resolve(__dirname, 'packages/backend/index.ts')
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                loader: 'ts-loader'
            }
        ]
    },
    resolve: { extensions: ['.ts'] },
    output: {
        chunkFilename: '[name].js',
        filename: '[name].js'
    },

    mode: 'development',
    plugins: [new UglifyJSPlugin()],
    devtool: 'source-map'
}
