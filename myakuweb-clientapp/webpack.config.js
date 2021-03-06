const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const APP_PATH = path.resolve(__dirname, 'src');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

    entry: {
        myakuweb: APP_PATH,
    },

    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist', 'static'),
        publicPath: '/static/',
    },

    devtool: 'source-map',

    optimization: {
        moduleIds: 'hashed',
        runtimeChunk: 'single',
        minimizer: [
            new TerserJSPlugin(),
            new OptimizeCSSAssetsPlugin(),
        ],
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },

    resolve: {
        plugins: [
            new TsconfigPathsPlugin({
                configFile: './tsconfig.json',
            }),
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'source-map-loader',
                enforce: 'pre',
            },
            {
                test: /\.ts(x?)$/i,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.svg$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[contenthash].[ext]',
                            outputPath: 'images',
                        },
                    },
                    'image-webpack-loader',
                ],
            },
            {
                test: /\.(woff|woff2)$/i,
                loader: 'file-loader',
                options: {
                    name: '[name].[contenthash].[ext]',
                    outputPath: 'webfonts',
                },
            },
        ],
    },

    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[name].[contenthash].css',
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(APP_PATH, 'index.html'),
            filename: '../index.html',
            minify: false,
        }),
        new PreloadWebpackPlugin({
            rel: 'preload',
            include: 'allAssets',
            as(entry) {
                if (/\.svg$/.test(entry)) {
                    return 'image';
                }
                if (/\.woff2$/.test(entry)) {
                    return 'font';
                }

                throw new Error(`Unexpected preload entry ${entry}`);
            },
            fileWhitelist: [/\.woff2$/, /myaku-logo.*\.svg$/],
        }),
    ],
};
