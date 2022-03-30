import resolve from "rollup-plugin-node-resolve";
import vue from "rollup-plugin-vue2";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import scss from "rollup-plugin-scss";
export default {
  input: "src/index.js", // 必须，入口文件
  external: ["lodash", "element-ui"],
  output: {
    file: "./dist/index.js", // 生成的文件
    name: "index",
    globals: {
      format: "esm",
      vue: "Vue", // 告诉rollup全局变量Vue即是vue
    },
  },
  plugins: [
    // 引入的插件在这里配置
    resolve(),
    scss(),
    vue({
      css: true,
      compileTemplate: true,
    }),
    babel({
      exclude: "**/node_modules/**",
    }),
    commonjs(),
  ],
};
