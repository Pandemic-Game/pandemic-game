const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'src'),
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'src/public/index.html', to: 'index.html' },
                { from: 'src/public/style.css', to: 'style.css' },
				{ from: 'src/public/person.png', to: 'person.png' },
            ],
        }),
    ],
    module: {
        rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }],
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        compress: true,
        port: 9000,
        open: true,
        stats: {
            assets: false,
            children: false,
            chunks: false,
            chunkModules: false,
            colors: true,
            entrypoints: false,
            hash: false,
            modules: false,
            timings: false,
            version: false,
        },
    },
    watch: false,
    devtool: 'inline-source-map',
};
