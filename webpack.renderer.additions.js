module.exports = {
  module: {
    rules: [
      {
        loader: "babel-loader",
        options: {
          presets: ["@babel/react"]
        }
      }
    ]
  },
  resolve: {
      extensions: ['.jsx']
    }
}; 