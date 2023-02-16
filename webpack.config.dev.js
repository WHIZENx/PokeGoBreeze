const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const manifest = require('./public/manifest.json');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TSLintPlugin = require('tslint-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackFavicons = require('webpack-favicons');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CssnanoPlugin = require('cssnano-webpack-plugin');

const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const publicPath = process.env.PUBLIC_URL || '/';

dotenv.config();

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico'
    }),
    new MiniCssExtractPlugin({
      filename: '[contenthash].css',
      chunkFilename: '[hash].css'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(
        { REACT_APP_TOKEN_PRIVATE_REPO: process.env.REACT_APP_TOKEN_PRIVATE_REPO,
          NODE_ENV: JSON.stringify('development'),
          DEBUG: true
        }
      )
    }),
    new TSLintPlugin({
      files: ['./src/**/*.{ts,tsx}']
    }),
    new ESLintPlugin({
      files: ['./src/**/*.{ts,tsx}'],
      emitWarning: false,
      failOnWarning: false
    }),
    new StylelintPlugin({
      files: ['./src/**/*.scss']
    }),
    new WebpackFavicons({
      src: 'src/assets/pokedex.png',
      path: 'img',
      background: '#000',
      theme_color: '#000',
      icons: {
        favicons: true
      }
    }),
    new WebpackManifestPlugin({
      fileName: './manifest.json',
      seed: manifest
    }),
    new CleanWebpackPlugin()
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
          name: "reactVendor",
          enforce: true
        },
        utilityVendor: {
          test: /[\\/]node_modules[\\/](lodash|moment|moment-timezone)[\\/]/,
          name: "utilityVendor",
          enforce: true
        },
        bootstrapVendor: {
          test: /[\\/]node_modules[\\/](react-bootstrap)[\\/]/,
          name: "bootstrapVendor",
          enforce: true
        },
        vendor: {
          test: /[\\/]node_modules[\\/](!react-bootstrap)(!lodash)(!moment)(!moment-timezone)[\\/]/,
          name: "vendor",
          enforce: true
        }
      },
    },
    minimizer: [
      new UglifyJSPlugin({
        uglifyOptions: {
          warnings: false,
          output: {
            comments: false,
          },
          sourceMap: true,
          minimize: false,
        }
      }),
      new CssnanoPlugin({
        sourceMap: true
      })
    ]
  },
  mode: 'development',
  bail: false,
  target: 'web',
  devtool: 'inline-source-map',
  performance: {
    hints: false,
  },
  devServer: {
    static: [
      { directory: path.resolve(__dirname, 'dist') },
      { directory: path.resolve(__dirname, 'public') },
    ],
    historyApiFallback: true,
    open: true,
    compress: true,
    port: 9000,
  },
  entry: {
    src: ['./src/index.tsx'],
    vendors: ['react']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[contenthash].js',
    chunkFilename: "[chunkhash].js",
    publicPath,
    clean: true,
  },
  resolve: {
    modules: [path.join(__dirname, 'src'), 'node_modules'],
    alias: {
      react: path.join(__dirname, 'node_modules', 'react'),
      process: "process/browser"
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ["ts-loader"],
      },
      {
        test: /\.s?css$/i,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: true,
                importLoaders: 1,
                sourceMap: true
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                    plugins: [
                      "postcss-preset-env",
                      autoprefixer
                    ]
                  }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  indentWidth: 2,
                  sourceMap: true,
                },
              },
            }
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