const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const manifest = require('./public/manifest.json');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackFavicons = require('webpack-favicons');

const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const publicPath = process.env.PUBLIC_URL || '/';

dotenv.config();

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
      inject: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        REACT_APP_TOKEN_PRIVATE_REPO: process.env.REACT_APP_TOKEN_PRIVATE_REPO,
        REACT_APP_POKEGO_BREEZE_DB_URL: process.env.REACT_APP_POKEGO_BREEZE_DB_URL,
        REACT_APP_EDGE_CONFIG: process.env.REACT_APP_EDGE_CONFIG,
        REACT_APP_DEPLOYMENT_MODE: process.env.REACT_APP_DEPLOYMENT_MODE,
        REACT_APP_ENCRYPTION_KEY: process.env.REACT_APP_ENCRYPTION_KEY,
        REACT_APP_ENCRYPTION_SALT: process.env.REACT_APP_ENCRYPTION_SALT,
        REACT_APP_VERSION: process.env.REACT_APP_VERSION,
        NODE_ENV: JSON.stringify('development'),
        DEBUG: true,
      }),
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      files: ['./src/**/*.{ts,tsx}'],
      emitWarning: true,
      failOnWarning: false,
    }),
    new StylelintPlugin({
      files: ['./src/**/*.scss'],
    }),
    new WebpackFavicons({
      src: 'src/assets/pokedex.png',
      path: 'img',
      background: '#000',
      theme_color: '#000',
      icons: {
        favicons: true,
      },
    }),
    new WebpackManifestPlugin({
      fileName: './manifest.json',
      seed: manifest,
    }),
    new CleanWebpackPlugin(),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 20,
      minSize: 20000,
      cacheGroups: {
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'reactVendor',
          priority: 30,
          enforce: true,
        },
        utilityVendor: {
          test: /[\\/]node_modules[\\/](lodash|moment|moment-timezone)[\\/]/,
          name: 'utilityVendor',
          priority: 20,
          enforce: true,
        },
        bootstrapVendor: {
          test: /[\\/]node_modules[\\/](react-bootstrap)[\\/]/,
          name: 'bootstrapVendor',
          priority: 20,
          enforce: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10,
          enforce: true,
          reuseExistingChunk: true,
        },
      },
    },
    minimizer: [],
  },
  mode: 'development',
  bail: false,
  target: 'web',
  devtool: 'eval-source-map',
  performance: {
    hints: false,
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  devServer: {
    static: [{ directory: path.resolve(__dirname, 'dist') }, { directory: path.resolve(__dirname, 'public') }],
    historyApiFallback: true,
    open: true,
    compress: true,
    port: 9000,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      progress: true,
    },
  },
  entry: {
    main: './src/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/js/[name].[contenthash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    publicPath,
    clean: true,
  },
  resolve: {
    modules: [path.join(__dirname, 'src'), 'node_modules'],
    alias: {
      react: path.join(__dirname, 'node_modules', 'react'),
      process: 'process/browser',
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      'process/browser': require.resolve('process/browser'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          },
        ],
      },
      {
        test: /\.s?css$/i,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: true,
              importLoaders: 2,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-preset-env', autoprefixer, 'postcss-flexbugs-fixes'],
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                indentWidth: 2,
              },
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(gif|png|jpe?g)$/i,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024,
          },
        },
        generator: {
          filename: 'static/media/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.svg$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
