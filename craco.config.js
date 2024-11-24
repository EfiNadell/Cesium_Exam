const path = require("path");

module.exports = {
    devtool: false, // Disable source maps,
    webpack: {
    alias: {
      cesium: path.resolve(__dirname, "node_modules/cesium"),
    },
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.css$/,
        use: [
          require.resolve("style-loader"),
          {
            loader: require.resolve("css-loader"),
            options: {
              importLoaders: 1,
            },
          },
        ],
      });

      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        cesium: path.resolve(__dirname, "node_modules/cesium"),
        "@cesium/engine": path.resolve(__dirname, "node_modules/@cesium/engine"),
      };

      return webpackConfig;
    },
  },
};