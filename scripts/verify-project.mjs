import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const requiredFiles = [
  "index.html",
  "support.js",
  "assets/css/app.css",
  "assets/js/app.js"
];

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`缺少项目文件：${relativePath}`);
  }
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const appJs = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
const supportJs = fs.readFileSync(path.join(root, "support.js"), "utf8");

for (const reference of [
  "./assets/css/app.css",
  "./assets/js/app.js",
  "./support.js"
]) {
  if (!html.includes(reference)) {
    throw new Error(`入口文件缺少引用：${reference}`);
  }
}

if (!html.includes("window.GGZApp.createComponent(DCLogic)")) {
  throw new Error("入口文件缺少业务组件启动代码。");
}
if (/<style(?:\s|>)/i.test(html)) {
  throw new Error("index.html 中仍有内联样式，请移入 assets/css/app.css。");
}
if (!appJs.includes("showColdPromotionColor")) {
  throw new Error("业务脚本缺少带冷提颜色功能。");
}
if (!appJs.includes("matrixBoughtCells")) {
  throw new Error("业务脚本缺少买齐标记功能。");
}

new vm.Script(appJs, { filename: "assets/js/app.js" });
new vm.Script(supportJs, { filename: "support.js" });

console.log("项目检查通过：文件齐全、引用正确、JavaScript 语法正常。");
