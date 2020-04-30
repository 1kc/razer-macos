const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: [{ loader: 'babel-loader' }]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
    ]
  },
  resolve: {
      extensions: ['.jsx', '.css']
    }
}; 