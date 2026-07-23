<div align="center">

  <a href="https://github.com/openforge-teams/inspiration-canvas">
    <img src="https://img.shields.io/badge/Inspiration_Canvas-灵感画布-6366F1?style=for-the-badge&logo=canvas&logoColor=white" alt="Inspiration Canvas"/>
  </a>

  <p></p>

  **零设计基础，也能创造专业级视觉内容**

  <p></p>

  [![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Konva](https://img.shields.io/badge/Konva.js-7B42BC?style=for-the-badge&logo=canvas&logoColor=white)](https://konvajs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

  <p></p>

  [![License](https://img.shields.io/github/license/openforge-teams/inspiration-canvas?style=flat-square)](LICENSE)
  [![Issues](https://img.shields.io/github/issues/openforge-teams/inspiration-canvas?style=flat-square)](https://github.com/openforge-teams/inspiration-canvas/issues)
  [![Stars](https://img.shields.io/github/stars/openforge-teams/inspiration-canvas?style=flat-square)](https://github.com/openforge-teams/inspiration-canvas/stargazers)
  [![Last Commit](https://img.shields.io/github/last-commit/openforge-teams/inspiration-canvas?style=flat-square)](https://github.com/openforge-teams/inspiration-canvas/commits)

</div>

---

## 产品预览

<p align="center">
  <strong>所见即所得的专业级设计体验</strong>
</p>

<table>
  <tr>
    <td width="50%">
      <p align="center"><strong>整洁的编辑界面</strong></p>
      <a href="docs/screenshots/main-interface.png">
        <img src="docs/screenshots/main-interface.png" alt="主界面预览" border="0" />
      </a>
    </td>
    <td width="50%">
      <p align="center"><strong>自由的创作体验</strong></p>
      <a href="docs/screenshots/editing-interface.png">
        <img src="docs/screenshots/editing-interface.png" alt="编辑界面预览" border="0" />
      </a>
    </td>
  </tr>
</table>

---

## 产品理念

灵感画布不是另一个 Photoshop。它是为非设计人员打造的创作引擎——把设计决策拆解为**模板 + 素材 + 编辑器**三段式，让每个人都能在 5 分钟内产出专业级视觉内容。

> 设计不是专业人士的特权，而是每个人表达想法的工具。

---

## 核心能力

<table>
  <tr>
    <td width="25%" align="center">
      <strong>画布引擎</strong><br/><br/>
      基于 Konva.js 的高性能矢量渲染，60fps 流畅交互，支持视口裁剪与智能参考线
    </td>
    <td width="25%" align="center">
      <strong>多元素支持</strong><br/><br/>
      文本、图片、形状、线条、图标……所见即所得，非破坏性编辑
    </td>
    <td width="25%" align="center">
      <strong>模板系统</strong><br/><br/>
      参数化模板引擎，一键套用小红书、PPT、海报、简历等 20+ 尺寸预设
    </td>
    <td width="25%" align="center">
      <strong>实时协作</strong><br/><br/>
      WebSocket + CRDT，多人同时编辑，光标同步，操作回溯
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>多格式导出</strong><br/><br/>
      PNG / JPG / PDF / SVG，支持透明背景、高清缩放、CMYK 色彩空间
    </td>
    <td align="center">
      <strong>图层管理</strong><br/><br/>
      分组、锁定、排序、可见性切换，复杂设计也井然有序
    </td>
    <td align="center">
      <strong>历史回溯</strong><br/><br/>
      无限撤销/重做，每一步操作都可追溯
    </td>
    <td align="center">
      <strong>品牌中心</strong><br/><br/>
      锁定品牌色值、字体、Logo，团队输出视觉统一
    </td>
  </tr>
</table>

---

## 技术架构

```mermaid
flowchart TD
    subgraph Layer7["存储层"]
        direction LR
        PG["PostgreSQL<br/><small>元数据</small>"]
        OS["对象存储<br/><small>素材</small>"]
        CDN["CDN<br/><small>边缘分发</small>"]
    end

    subgraph Layer6["中间件层"]
        direction LR
        Redis["Redis<br/><small>缓存 / 会话</small>"]
        MQ["消息队列<br/><small>异步任务</small>"]
    end

    subgraph Layer5["业务服务层"]
        direction LR
        S1["用户服务"]
        S2["模板服务"]
        S3["素材服务"]
        S4["协作服务"]
        S5["导出服务"]
        S6["品牌服务"]
    end

    subgraph Layer4["API 网关层"]
        REST["REST API · 会话管理 · 文件上传"]
    end

    subgraph Layer3["实时通信层"]
        WS["WebSocket · 协作同步 · 光标广播"]
    end

    subgraph Layer2["客户端层"]
        Client["React 18 · TypeScript · Vite · Konva.js · Zustand · Tailwind"]
    end

    Layer2 --> Layer3
    Layer2 --> Layer4
    Layer3 --> Layer4
    Layer4 --> Layer5
    Layer5 --> Layer6
    Layer6 --> Layer7

    classDef layer fill:#f8fafc,stroke:#e2e8f0,stroke-width:1px;
    class Layer2,Layer3,Layer4,Layer5,Layer6,Layer7 layer;
```

### 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | **React 18** | 并发特性、自动批处理 |
| 语言 | **TypeScript 5** | 全链路类型安全 |
| 构建工具 | **Vite 5** | 秒级冷启动、HMR |
| 图形引擎 | **Konva.js** | 2D Canvas 高性能渲染 |
| 状态管理 | **Zustand** | 极简、可预测、可时间旅行 |
| 样式方案 | **Tailwind CSS** | 原子化 CSS，设计系统驱动 |
| 后端 | **Node.js + Express** | 高并发协作服务 |
| 实时通信 | **WebSocket + Yjs** | CRDT 冲突解决 |
| 数据库 | **PostgreSQL + Redis** | 持久化 + 缓存层 |
| 包管理 | **pnpm** | Monorepo 高效依赖管理 |

---

## 快速开始

### 环境要求

- Node.js ≥ 18
- pnpm ≥ 8

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/openforge-teams/inspiration-canvas.git
cd inspiration-canvas

# 安装依赖
pnpm install

# 启动开发服务（前端 + 后端并行）
pnpm dev

# 或分别启动
pnpm dev:web      # 前端: http://localhost:5173
pnpm dev:server   # 后端: http://localhost:3001
```

### 构建生产版本

```bash
# 构建所有包
pnpm build

# 仅构建前端
pnpm build:web

# 仅构建后端
pnpm build:server

# 启动生产服务
pnpm start
```

---

## 项目结构

```
inspiration-canvas/
├── apps/
│   ├── web/                 # 前端应用 (React + TS + Konva)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── canvas/  # 画布引擎 & 元素渲染
│   │   │   │   ├── layout/  # 页面布局
│   │   │   │   ├── panels/  # 属性面板
│   │   │   │   ├── common/  # 通用组件
│   │   │   │   └── modals/  # 弹窗组件
│   │   │   ├── store/        # Zustand 状态管理
│   │   │   ├── data/         # 模板 & 素材数据
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   └── package.json
│   └── server/              # 后端服务 (Node.js + Express + WebSocket)
│       └── src/
│           ├── index.ts      # 服务入口 & 路由
│           └── types.ts      # 消息协议类型
├── packages/
│   └── shared/              # 共享类型 & 工具函数
│       └── src/
│           └── index.ts      # 元素工厂 & 文档模型 & 类型定义
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

---

## 路线图

| 阶段 | 时间 | 里程碑 |
|------|------|--------|
| **Phase 0** | Month 1–3 | 基础编辑器：画布引擎、元素系统、单人编辑、本地持久化、基础导出 |
| **Phase 1** | Month 3–5 | 模板与素材：参数化模板引擎、语义检索、多尺寸适配、品牌中心 MVP |
| **Phase 2** | Month 5–8 | 实时协作：WebSocket 服务、CRDT 冲突解决、光标同步、评论、版本管理 |
| **Phase 3** | Month 8–12 | AI 能力：AI 生图 / 文案、魔法消除、智能抠图、对话式设计助手 |
| **Phase 4** | Month 12+ | 平台化：开放 API、供稿人生态、企业 SSO、多端客户端 (Desktop/Mobile) |

---

## 贡献指南

欢迎贡献代码。提交 PR 前请确保：

1. 代码通过 TypeScript 类型检查
2. 遵循现有代码风格
3. 提供必要的注释与文档

---

## 许可证

MIT License — 详见 [LICENSE](LICENSE) 文件。

---

<div align="center">

**Crafted with care for every creator.**

[Website](http://localhost:5173) · [Issues](https://github.com/openforge-teams/inspiration-canvas/issues) · [GitHub](https://github.com/openforge-teams/inspiration-canvas)

</div>
