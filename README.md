# Kotlin 全语法与 Android 独立开发课程

本文件夹包含一套从 Kotlin 零基础到现代 Android 独立开发的完整中文课程。

## 直接开始学习

- 双击 `Kotlin全语法教学.html`：打开带目录、搜索、进度保存、代码复制、深色模式和测验的离线网页。
- 打开 `Kotlin从零到Android开发全教程.md`：阅读或在编辑器中做笔记。

网页完全离线，不依赖网络；学习进度保存在当前浏览器中。

## 课程覆盖

1. Kotlin 程序结构、变量、类型、运算符、空安全和流程控制
2. 函数、类、接口、数据类、密封类型、集合与序列
3. Lambda、高阶函数、作用域函数、扩展、泛型与型变
4. 委托、DSL、异常、Java 互操作、协程与 Flow
5. Android 生命周期、Intent、权限与项目结构
6. Jetpack Compose、状态、副作用、主题、无障碍和自适应布局
7. Navigation、ViewModel、单向数据流、Repository 与依赖注入
8. 网络、序列化、Room、DataStore、离线同步和 WorkManager
9. 测试、调试、性能、安全、构建、签名和发布
10. 可验收的离线优先任务管理 App 毕业项目

## 可选：以开发服务器运行网页

安装 Node.js 22.13 或更高版本后：

```powershell
npm install
npm run build:course
npm run dev
```

修改 Markdown 正文后运行 `npm run build:course`，即可重新生成根目录与 `public` 目录中的 HTML。

## 学习建议

每天完成一小节并亲手改写示例。先用 Fake Repository 完成界面，再接 Room 和网络；每项功能都验证加载、空、错误和内容状态。最后按第 25 章的验收清单独立完成毕业项目。
