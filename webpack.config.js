const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
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
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', { targets: 'defaults' }]],
                    },
                },
            },
        ],
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
    devtool: 'source-map',
};
