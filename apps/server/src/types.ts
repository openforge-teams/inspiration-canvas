import type { CanvasElement, CollaboratorCursor, DesignDocument } from '@inspiration/shared';

// WebSocket 消息类型
export type WSMessageType =
  | 'hello'
  | 'welcome'
  | 'cursor'
  | 'element_update'
  | 'element_create'
  | 'element_delete'
  | 'design_update'
  | 'selection'
  | 'chat'
  | 'user_join'
  | 'user_leave'
  | 'ping'
  | 'pong';

// WebSocket 消息基础接口
export interface WSBaseMessage {
  type: WSMessageType;
  timestamp: number;
}

// 客户端打招呼消息
export interface WSHelloMessage extends WSBaseMessage {
  type: 'hello';
  userId: string;
  userName: string;
  avatar: string;
}

// 服务器欢迎消息
export interface WSWelcomeMessage extends WSBaseMessage {
  type: 'welcome';
  clientId: string;
  design: DesignDocument | null;
  collaborators: CollaboratorCursor[];
}

// 光标位置消息
export interface WSCursorMessage extends WSBaseMessage {
  type: 'cursor';
  userId: string;
  userName: string;
  avatar: string;
  color: string;
  x: number;
  y: number;
  selectedElementId: string | null;
}

// 元素更新消息
export interface WSElementUpdateMessage extends WSBaseMessage {
  type: 'element_update';
  elementId: string;
  partialProps: Partial<CanvasElement['props']>;
  userId: string;
}

// 元素创建消息
export interface WSElementCreateMessage extends WSBaseMessage {
  type: 'element_create';
  element: CanvasElement;
  userId: string;
}

// 元素删除消息
export interface WSElementDeleteMessage extends WSBaseMessage {
  type: 'element_delete';
  elementId: string;
  userId: string;
}

// 设计更新消息
export interface WSDesignUpdateMessage extends WSBaseMessage {
  type: 'design_update';
  design: Partial<DesignDocument>;
  userId: string;
}

// 选择消息
export interface WSSelectionMessage extends WSBaseMessage {
  type: 'selection';
  userId: string;
  elementIds: string[];
}

// 聊天消息
export interface WSChatMessage extends WSBaseMessage {
  type: 'chat';
  userId: string;
  userName: string;
  content: string;
}

// 用户加入消息
export interface WSUserJoinMessage extends WSBaseMessage {
  type: 'user_join';
  userId: string;
  userName: string;
  avatar: string;
}

// 用户离开消息
export interface WSUserLeaveMessage extends WSBaseMessage {
  type: 'user_leave';
  userId: string;
}

// 心跳消息
export interface WSPingMessage extends WSBaseMessage {
  type: 'ping';
}

export interface WSPongMessage extends WSBaseMessage {
  type: 'pong';
}

// 联合消息类型
export type WSMessage =
  | WSHelloMessage
  | WSWelcomeMessage
  | WSCursorMessage
  | WSElementUpdateMessage
  | WSElementCreateMessage
  | WSElementDeleteMessage
  | WSDesignUpdateMessage
  | WSSelectionMessage
  | WSChatMessage
  | WSUserJoinMessage
  | WSUserLeaveMessage
  | WSPingMessage
  | WSPongMessage;

// 客户端发送的消息
export type WSClientMessage =
  | WSHelloMessage
  | WSCursorMessage
  | WSElementUpdateMessage
  | WSElementCreateMessage
  | WSElementDeleteMessage
  | WSDesignUpdateMessage
  | WSSelectionMessage
  | WSChatMessage
  | WSPingMessage;

// 服务器广播的消息
export type WSServerMessage =
  | WSWelcomeMessage
  | WSCursorMessage
  | WSElementUpdateMessage
  | WSElementCreateMessage
  | WSElementDeleteMessage
  | WSDesignUpdateMessage
  | WSSelectionMessage
  | WSChatMessage
  | WSUserJoinMessage
  | WSUserLeaveMessage
  | WSPongMessage;

// 协作房间中的客户端信息
export interface CollaboratorClient {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  color: string;
  cursor: { x: number; y: number; selectedElementId: string | null };
}
