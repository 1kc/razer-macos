const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'native-ext-loader',
        rewritePath: path.resolve(__dirname, 'dist'),
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/devices", to: "../devices" },
      ],
      options: {
        concurrency: 100,
      },
    }),
  ],
  resolve: {
    extensions: ['.node'],
  },
};
