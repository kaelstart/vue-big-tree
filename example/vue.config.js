const path = require("path");
const resolve = (dir) => path.join(__dirname, dir);
const Alias = {
  "@": "src",
};
module.exports = {
  lintOnSave: false,
  chainWebpack: (config) => {
    const alias = config.resolve.alias;
    Object.keys(Alias).forEach((key) => alias.set(key, resolve(Alias[key])));
  },
};
