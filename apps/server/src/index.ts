import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import type { Template, Asset, DesignDocument } from '@inspiration/shared';
import type {
  WSClientMessage,
  WSServerMessage,
  CollaboratorClient,
  WSWelcomeMessage,
  WSUserJoinMessage,
  WSUserLeaveMessage,
} from './types.js';

const PORT = 3001;

// ============================================
// 模拟数据
// ============================================

// 模板列表（模拟数据）
const templates: Template[] = [
  {
    id: 'tpl-001',
    name: '小红书简约封面',
    category: '小红书',
    tags: ['简约', '封面', '小红书', '清新'],
    previewUrl: '',
    width: 1080,
    height: 1440,
    elements: [],
    background: { type: 'solid', color: '#FFE4E6' },
    author: 'Inspiration',
    usageCount: 12580,
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'tpl-002',
    name: '活动宣传海报',
    category: '海报',
    tags: ['活动', '宣传', '商务', '现代'],
    previewUrl: '',
    width: 1080,
    height: 1920,
    elements: [],
    background: { type: 'solid', color: '#0F172A' },
    author: 'Inspiration',
    usageCount: 8920,
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'tpl-003',
    name: '简约专业简历',
    category: '简历',
    tags: ['简历', '求职', '简约', '专业'],
    previewUrl: '',
    width: 794,
    height: 1123,
    elements: [],
    background: { type: 'solid', color: '#FFFFFF' },
    author: 'Inspiration',
    usageCount: 15680,
    createdAt: Date.now() - 86400000 * 60,
  },
];

// 素材列表（模拟数据）
const assets: Asset[] = [
  {
    id: 'asset-001',
    type: 'image',
    name: '山脉风景',
    tags: ['风景', '自然', '山脉'],
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
    width: 1920,
    height: 1280,
    licenseType: 'free',
  },
  {
    id: 'asset-002',
    type: 'image',
    name: '城市夜景',
    tags: ['城市', '夜景', '建筑'],
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390',
    thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200',
    width: 1920,
    height: 1080,
    licenseType: 'free',
  },
  {
    id: 'asset-003',
    type: 'icon',
    name: '用户图标',
    tags: ['图标', '用户', 'UI'],
    url: '',
    licenseType: 'free',
  },
];

// 内存存储：设计文档
const designsStore = new Map<string, DesignDocument>();

// ============================================
// 协作房间管理
// ============================================

interface Room {
  designId: string;
  clients: Map<string, CollaboratorClient>;
}

const rooms = new Map<string, Room>();

// 协作光标颜色池
const CURSOR_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

function getCursorColor(index: number): string {
  return CURSOR_COLORS[index % CURSOR_COLORS.length];
}

function getOrCreateRoom(designId: string): Room {
  let room = rooms.get(designId);
  if (!room) {
    room = {
      designId,
      clients: new Map(),
    };
    rooms.set(designId, room);
  }
  return room;
}

function broadcastToRoom(room: Room, message: WSServerMessage, excludeClientId?: string) {
  const data = JSON.stringify(message);
  room.clients.forEach((client, clientId) => {
    if (clientId !== excludeClientId) {
      const ws = clientSockets.get(clientId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  });
}

// clientId -> WebSocket 映射
const clientSockets = new Map<string, WebSocket>();

// ============================================
// Express 应用
// ============================================

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

// 获取模板列表
app.get('/api/templates', (_req, res) => {
  res.json({
    data: templates,
    total: templates.length,
  });
});

// 获取素材列表
app.get('/api/assets', (_req, res) => {
  res.json({
    data: assets,
    total: assets.length,
  });
});

// 保存设计
app.post('/api/designs', (req, res) => {
  const design = req.body as DesignDocument;

  if (!design || !design.id) {
    return res.status(400).json({ error: '无效的设计数据' });
  }

  designsStore.set(design.id, {
    ...design,
    updatedAt: Date.now(),
  });

  res.json({
    success: true,
    data: designsStore.get(design.id),
  });
});

// 获取设计
app.get('/api/designs/:id', (req, res) => {
  const { id } = req.params;
  const design = designsStore.get(id);

  if (!design) {
    return res.status(404).json({ error: '设计不存在' });
  }

  res.json({
    data: design,
  });
});

// ============================================
// HTTP 服务器 & WebSocket
// ============================================

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// 处理 WebSocket 升级
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url || '';

  // 匹配 /ws/collab/:designId
  const match = pathname.match(/^\/ws\/collab\/(.+)$/);
  if (!match) {
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
    return;
  }

  const designId = decodeURIComponent(match[1]);

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request, designId);
  });
});

// WebSocket 连接处理
wss.on('connection', (ws: WebSocket, _request: any, designId: string) => {
  const clientId = uuidv4();
  const room = getOrCreateRoom(designId);

  console.log(`[WS] Client connected: ${clientId} to room: ${designId}`);

  clientSockets.set(clientId, ws);

  // 处理收到的消息
  ws.on('message', (rawData) => {
    try {
      const message = JSON.parse(rawData.toString()) as WSClientMessage;

      switch (message.type) {
        case 'hello': {
          // 客户端打招呼，注册到房间
          const color = getCursorColor(room.clients.size);
          const client: CollaboratorClient = {
            id: clientId,
            userId: message.userId,
            userName: message.userName,
            avatar: message.avatar,
            color,
            cursor: { x: 0, y: 0, selectedElementId: null },
          };
          room.clients.set(clientId, client);

          // 发送欢迎消息
          const welcome: WSWelcomeMessage = {
            type: 'welcome',
            timestamp: Date.now(),
            clientId,
            design: designsStore.get(designId) || null,
            collaborators: Array.from(room.clients.values()).map((c) => ({
              userId: c.userId,
              userName: c.userName,
              avatar: c.avatar,
              color: c.color,
              x: c.cursor.x,
              y: c.cursor.y,
              selectedElementId: c.cursor.selectedElementId,
            })),
          };
          ws.send(JSON.stringify(welcome));

          // 广播用户加入
          const joinMsg: WSUserJoinMessage = {
            type: 'user_join',
            timestamp: Date.now(),
            userId: message.userId,
            userName: message.userName,
            avatar: message.avatar,
          };
          broadcastToRoom(room, joinMsg, clientId);
          break;
        }

        case 'cursor': {
          // 更新光标位置并广播
          const client = room.clients.get(clientId);
          if (client) {
            client.cursor = {
              x: message.x,
              y: message.y,
              selectedElementId: message.selectedElementId,
            };
          }
          broadcastToRoom(room, message, clientId);
          break;
        }

        case 'element_update':
        case 'element_create':
        case 'element_delete':
        case 'design_update':
        case 'selection':
        case 'chat': {
          // 直接广播到房间其他成员
          broadcastToRoom(room, message, clientId);
          break;
        }

        case 'ping': {
          ws.send(
            JSON.stringify({
              type: 'pong',
              timestamp: Date.now(),
            })
          );
          break;
        }

        default:
          console.warn(`[WS] Unknown message type: ${(message as WSClientMessage).type}`);
      }
    } catch (error) {
      console.error('[WS] Error parsing message:', error);
    }
  });

  // 连接断开
  ws.on('close', () => {
    console.log(`[WS] Client disconnected: ${clientId} from room: ${designId}`);

    const client = room.clients.get(clientId);
    if (client) {
      // 广播用户离开
      const leaveMsg: WSUserLeaveMessage = {
        type: 'user_leave',
        timestamp: Date.now(),
        userId: client.userId,
      };
      broadcastToRoom(room, leaveMsg);

      room.clients.delete(clientId);
    }

    clientSockets.delete(clientId);

    // 如果房间为空，清理房间
    if (room.clients.size === 0) {
      rooms.delete(designId);
      console.log(`[WS] Room cleaned up: ${designId}`);
    }
  });

  // 错误处理
  ws.on('error', (error) => {
    console.error(`[WS] Error for client ${clientId}:`, error);
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   Inspiration Canvas Server                   ║
╠══════════════════════════════════════════════╣
║   REST API:  http://localhost:${PORT}/api       ║
║   WebSocket: ws://localhost:${PORT}/ws/collab/  ║
║   Health:    http://localhost:${PORT}/api/health║
╚══════════════════════════════════════════════╝
  `);
});
