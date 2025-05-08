const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const manifest = require('./public/manifest.json');
const { merge } = require('webpack-merge');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackFavicons = require('webpack-favicons');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const publicPath = process.env.PUBLIC_URL || '/';

dotenv.config();

const common = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new ESLintPlugin({
      files: ['./src/**/*.{ts,tsx}'],
      failOnWarning: true,
    }),
    new StylelintPlugin({
      files: ['./src/**/*.scss'],
      failOnWarning: true,
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
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'reactVendor',
          enforce: true,
        },
        utilityVendor: {
          test: /[\\/]node_modules[\\/](lodash|moment|moment-timezone)[\\/]/,
          name: 'utilityVendor',
          enforce: true,
        },
        bootstrapVendor: {
          test: /[\\/]node_modules[\\/](react-bootstrap)[\\/]/,
          name: 'bootstrapVendor',
          enforce: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/](!react-bootstrap)(!lodash)(!moment)(!moment-timezone)[\\/]/,
          name: 'vendor',
          enforce: true,
        },
      },
    },
  },
  mode: 'production',
  bail: true,
  target: 'web',
  performance: {
    hints: false,
  },
  devServer: {
    static: [{ directory: path.resolve(__dirname, 'dist') }, { directory: path.resolve(__dirname, 'public') }],
    historyApiFallback: true,
    open: true,
    compress: true,
    port: 9000,
    hot: true,
  },
  entry: {
    src: ['./src/index.tsx'],
    vendors: ['react'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[contenthash].js',
    chunkFilename: '[chunkhash].js',
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
        use: ['ts-loader'],
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
      },
    ],
  },
};

module.exports = merge(common, {
  mode: 'production',
  bail: true,
  devtool: false, // No source maps in production

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
      chunkFilename: 'css/[id].[contenthash].css',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        REACT_APP_TOKEN_PRIVATE_REPO: process.env.REACT_APP_TOKEN_PRIVATE_REPO,
        REACT_APP_POKEGO_BREEZE_DB_URL: process.env.REACT_APP_POKEGO_BREEZE_DB_URL,
        REACT_APP_EDGE_CONFIG: process.env.REACT_APP_EDGE_CONFIG,
        NODE_ENV: 'production',
        DEBUG: false,
      }),
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240, // Only compress assets > 10kb
      minRatio: 0.8, // Only compress if compression ratio is better than 0.8
    }),
  ],

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: true,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
              minifyFontValues: { removeQuotes: false },
            },
          ],
        },
      }),
    ],
  },

  module: {
    rules: [
      {
        test: /\.s?css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('postcss-preset-env')({
                    autoprefixer: {
                      flexbox: 'no-2009',
                    },
                    stage: 3,
                  }),
                  autoprefixer,
                ],
              },
              sourceMap: false,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                indentWidth: 2,
                outputStyle: 'compressed',
              },
              sourceMap: false,
            },
          },
        ],
      },
    ],
  },
});
