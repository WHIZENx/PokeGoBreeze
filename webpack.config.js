const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackFavicons = require('webpack-favicons');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

const publicPath = process.env.PUBLIC_URL || '/';

dotenv.config();

module.exports = {
    devtool: 'inline-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            favicon: './public/favicon.ico'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].bundle.css',
            chunkFilename: '[id].css'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(process.env)
        }),
        new ESLintPlugin(),
        new WebpackFavicons({
            src: 'public/logo192.png',
            path: 'img',
            background: '#000',
            theme_color: '#000',
            icons: {
                favicons: true
            }
        })
    ],
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                reactVendor: {
                    test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                    name: "reactvendor"
                },
                utilityVendor: {
                    test: /[\\/]node_modules[\\/](lodash|moment|moment-timezone)[\\/]/,
                    name: "utilityVendor"
                },
                bootstrapVendor: {
                    test: /[\\/]node_modules[\\/](react-bootstrap)[\\/]/,
                    name: "bootstrapVendor"
                },
                vendor: {
                    test: /[\\/]node_modules[\\/](!react-bootstrap)(!lodash)(!moment)(!moment-timezone)[\\/]/,
                    name: "vendor"
                },
            },
        },
    },
    mode: isProduction ? 'production' : 'development',
    bail: isProduction,
    target: 'web',
    devtool: 'cheap-module-source-map',
    devServer: {
        static: [
            { directory: path.resolve(__dirname, 'dist') },
            { directory: path.resolve(__dirname, 'public') },
        ],
        hot: true,
        historyApiFallback: true,
        open: true,
        compress: true,
        port: 9000,
    },
    entry: {
        src: ['./src/index.js'],
        vendors: ['react']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        chunkFilename: "[name].chunk.js",
        publicPath
    },
    resolve: {
        modules: [path.join(__dirname, 'src'), 'node_modules'],
        alias: {
            react: path.join(__dirname, 'node_modules', 'react'),
            process: "process/browser"
        },
    },
    module: {
        rules: [
        {
            test: /\.(jsx|js)$/,
            include: path.resolve(__dirname, 'src'),
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['@babel/preset-env', {
                            "targets": "defaults"
                        }],
                        '@babel/preset-react'
                    ]
                }
                }
            ]
        },
        {
            test: /\.css$/i,
            include: path.resolve(__dirname, 'src'),
            exclude: /node_modules/,
            use: [
            {
                loader: MiniCssExtractPlugin.loader,
                options: {}
            },
            {
                loader: 'css-loader',
                options: {
                    importLoaders: 0
                }
            },
            'postcss-loader'
            ]
        },
        {
            test: /\.(gif|png|jpe?g|svg)$/i,
            include: path.resolve(__dirname, 'src'),
            exclude: /node_modules/,
            use: [
                'file-loader',
                {
                    loader: 'image-webpack-loader',
                    options: {
                        bypassOnDebug: true, // webpack@1.x
                        disable: true, // webpack@2.x and newer
                    },
                },
            ],
        }
        ]
    }
}