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
const CompressionPlugin = require('compression-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const publicPath = process.env.PUBLIC_URL || '/';

dotenv.config();

const common = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      templateParameters: {
        PUBLIC_URL: publicPath.endsWith('/') ? publicPath.slice(0, -1) : publicPath,
      },
      hash: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      files: ['./src/**/*.{ts,tsx}'],
      emitWarning: true,
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
        android: true,
        appleIcon: true,
        appleStartup: true,
      },
    }),
    new WebpackManifestPlugin({
      fileName: './manifest.json',
      seed: manifest,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'public/og-image.png',
          to: 'og-image.png',
          toType: 'file',
          priority: 10,
        },
        {
          from: 'public',
          to: '',
          globOptions: {
            ignore: ['**/index.html', '**/favicon.ico', '**/manifest.json', '**/og-image.png'],
          },
          transform: {
            transformer: (content) => {
              return content;
            },
            cache: true,
          },
        },
      ],
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
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  mode: 'production',
  bail: true,
  target: 'web',
  devtool: false,
  performance: {
    hints: false,
  },
  cache: false,
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
              transpileOnly: false,
            },
          },
        ],
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
              importLoaders: 2,
              sourceMap: false,
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
              sourceMap: false,
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
            maxSize: 4 * 1024, // 4kb - inline if smaller
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

module.exports = merge(common, {
  mode: 'production',
  bail: true,
  devtool: false, // No source maps in production
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        REACT_APP_TOKEN_PRIVATE_REPO: process.env.REACT_APP_TOKEN_PRIVATE_REPO,
        REACT_APP_POKEGO_BREEZE_DB_URL: process.env.REACT_APP_POKEGO_BREEZE_DB_URL,
        REACT_APP_EDGE_CONFIG: process.env.REACT_APP_EDGE_CONFIG,
        REACT_APP_DEPLOYMENT_MODE: process.env.REACT_APP_DEPLOYMENT_MODE,
        REACT_APP_ENCRYPTION_KEY: process.env.REACT_APP_ENCRYPTION_KEY,
        REACT_APP_ENCRYPTION_SALT: process.env.REACT_APP_ENCRYPTION_SALT,
        NODE_ENV: 'production',
        DEBUG: false,
      }),
    }),
    new CompressionPlugin({
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
      deleteOriginalAssets: false,
      filename: '[path][base].br',
    }),
  ],
  optimization: {
    minimize: true,
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
    mangleExports: 'deterministic',
    concatenateModules: true,
    usedExports: true,
    sideEffects: true,
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 20000, // Increase from 0 to avoid too many small chunks
      maxSize: 244000, // Add a maximum chunk size
    },
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            passes: 2,
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
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
    name: 'production-cache',
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
