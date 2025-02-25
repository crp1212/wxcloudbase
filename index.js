// 引入所需模块
const path = require("path"); // 处理文件路径
const express = require("express"); // Express 框架
const cors = require("cors"); // 处理跨域请求
const morgan = require("morgan"); // HTTP 请求日志记录
// const { init: initDB, Counter } = require("./db"); // 数据库初始化及模型

// 创建 morgan 日志记录器
const logger = morgan("tiny");

// 创建 Express 应用实例
const app = express();

// 配置中间件
app.use(express.urlencoded({ extended: false })); // 解析 URL 编码的请求体
app.use(express.json()); // 解析 JSON 格式的请求体
app.use(cors()); // 启用跨域资源共享
app.use(logger); // 使用日志记录器

// 首页路由
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")); // 返回 index.html 文件
});
app.get("/test", async (req, res) => {
  res.send({
    status: 1,
    data: 5556
  })
});
// 更新计数路由
// app.post("/api/count", async (req, res) => {
//   const { action } = req.body; // 获取请求体中的 action 参数
//   if (action === "inc") {
//     await Counter.create(); // 如果 action 为 inc，创建新计数
//   } else if (action === "clear") {
//     await Counter.destroy({
//       truncate: true, // 如果 action 为 clear，清空计数
//     });
//   }
//   res.send({
//     code: 0, // 返回成功状态码
//     data: await Counter.count(), // 返回当前计数
//   });
// });

// // 获取计数路由
// app.get("/api/count", async (req, res) => {
//   const result = await Counter.count(); // 获取当前计数
//   res.send({
//     code: 0, // 返回成功状态码
//     data: result, // 返回计数结果
//   });
// });

// 获取微信 Open ID 路由
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) { // 检查请求头中是否包含微信来源标识
    res.send(req.headers["x-wx-openid"]); // 返回微信 Open ID
  }
});

// 设置端口号，优先使用环境变量中的 PORT，否则使用 80
const port = process.env.PORT || 80;

// 启动函数
async function bootstrap() {
  // await initDB(); // 初始化数据库
  app.listen(port, () => {
    console.log("启动成功", port); // 启动服务器并打印成功信息
  });
}

// 调用启动函数
bootstrap();
