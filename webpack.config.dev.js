const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'src'),
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()]
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
        new CopyPlugin({
            patterns: [{ from: 'public/index.html', to: 'index.html' }, { from: 'public/style/*.css' }]
        })
    ],
    module: {
        rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }]
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
            version: false
        }
    },
    watch: false,
    devtool: 'eval-source-map'
};
