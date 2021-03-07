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
  resolve: {
    extensions: ['.node'],
  },
};
