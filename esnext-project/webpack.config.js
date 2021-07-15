const path = require("path");
module.exports = {
  // entry file - webpack이 실행될 파일
  // https://v4.webpack.js.org/configuration/entry/
  entry: "./src/js/main.js",
  // 번들링된 js 파일의 이름(filename)과 저장될 경로(path)를 지정
  // https://v4.webpack.js.org/configuration/output/
  output: {
    path: path.join(__dirname, "dist/js"),
    filename: "bundle.js",
  },
  // https://v4.webpack.js.org/configuration/module/
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: [path.resolve(__dirname, "src/js")],
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  devtool: "source-map",
  // https://v4.webpack.js.org/configuration/mode/
  mode: "development",
};
