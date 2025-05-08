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
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

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
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        REACT_APP_TOKEN_PRIVATE_REPO: process.env.REACT_APP_TOKEN_PRIVATE_REPO,
        REACT_APP_POKEGO_BREEZE_DB_URL: process.env.REACT_APP_POKEGO_BREEZE_DB_URL,
        REACT_APP_EDGE_CONFIG: process.env.REACT_APP_EDGE_CONFIG,
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
    new ReactRefreshPlugin(),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 20, // Increase to allow for finer chunks
      minSize: 20000, // Avoid too small chunks
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
    // Only add minimizers for production
    minimizer: [],
  },
  mode: 'development',
  bail: false,
  target: 'web',
  // Use eval-source-map for better debugging but faster builds than inline-source-map
  devtool: 'eval-source-map',
  performance: {
    hints: false,
  },
  cache: {
    type: 'filesystem', // Use filesystem caching for faster rebuilds
    buildDependencies: {
      config: [__filename], // Invalidate cache when webpack config changes
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
        warnings: false, // Don't show warnings in browser overlay for cleaner dev experience
      },
      progress: true,
    },
  },
  entry: {
    main: './src/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[chunkhash].js',
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
              transpileOnly: true, // Speed up compilation in development
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
          'style-loader', // Use style-loader in development for HMR
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
                plugins: ['postcss-preset-env', autoprefixer],
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
        type: 'asset', // Use asset modules instead of file-loader
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb - inline if smaller
          },
        },
      },
      {
        test: /\.svg$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]',
        },
      },
    ],
  },
};
