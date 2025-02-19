const webpack = require("webpack")

module.exports = function override(config, env) {

  config.resolve.fallback = {
    ...config.resolve.fallback,
    'process/browser': require.resolve('process/browser'),
    stream: require.resolve("stream-browserify"),
    buffer: require.resolve("buffer"),
    crypto: require.resolve("crypto-browserify"),
    vm: require.resolve("vm-browserify"),
    url: require.resolve("url/"),
    util: require.resolve("util/")
  }
  config.resolve.extensions = [...config.resolve.extensions, ".tsx", ".ts", ".js"]
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
      crypto: "crypto-browserify",
      vm: "vm-browserify",
      url: "url/",
      util: "util/"
    }),
  ]

  return config
}