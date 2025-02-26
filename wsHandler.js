const { v4: uuidv4 } = require('uuid');
const { shuffleArray } = require('./utils/common')
const wsHandler = (app) => {
  function genMessage (userId, content) {
    const result = {
      id: uuidv4(),
      userId,
      content: msgData.content.trim(),
      timestamp: Date.now(),
      
    }
    return result
  }
  class RoomManager {
    constructor() {
      this.rooms = new Map(); // roomId -> Room
      this.historyLimit = 100; // 历史记录最大条数
    }
  
    getOrCreateRoom(roomId) {
      if (!this.rooms.has(roomId)) {
        const dataList = shuffleArray([10, 20, 30, 40, 50, 0, 0, 0, 0, 0])
        this.rooms.set(roomId, {
          users: new Map(), // userId -> ws
          history: [
            {
              type: 'init',
              data: dataList
            }
          ],
          cleanupTimer: null,
        });
      }
      return this.rooms.get(roomId);
    }
  
    addHistory(roomId, message) {
      const room = this.getOrCreateRoom(roomId);
      room.history.push(message);
      // 保持历史记录不超过限制
      if (room.history.length > this.historyLimit) {
        room.history.shift();
      }
    }
  
    scheduleCleanup(roomId) {
      const room = this.rooms.get(roomId);
      if (room && room.users.size === 0) {
        room.cleanupTimer = setTimeout(() => {
          this.rooms.delete(roomId);
          console.log(`Room ${roomId} cleaned up`);
        }, 5 * 60 * 1000); // 5分钟
      }
    }
  
    cancelCleanup(roomId) {
      const room = this.rooms.get(roomId);
      if (room && room.cleanupTimer) {
        clearTimeout(room.cleanupTimer);
        room.cleanupTimer = null;
      }
    }
  }
  
  const roomManager = new RoomManager();

  app.ws('/chat', (ws, req) => {
    const { roomId, userId } = req.query;
    if (!roomId || !userId) {
      ws.close(4001, 'Missing roomId or userId');
      return;
    }
  
    const room = roomManager.getOrCreateRoom(roomId);
    
    // 取消清理定时
    roomManager.cancelCleanup(roomId);
    
    // 保存用户连接
    room.users.set(userId, ws);
    console.log(`User ${userId} joined room ${roomId}`);
  
    // 发送历史记录
    ws.send(JSON.stringify({
      type: 'history',
      data: room.history
    }));
  
    ws.on('message', (message) => {
      try {
        const msgData = JSON.parse(message);
        if (!msgData.content || typeof msgData.content !== 'string') {
          return;
        }
  
        // 构造完整消息
        const chatMessage = genMessage()
  
        // 保存到历史
        roomManager.addHistory(roomId, chatMessage);
  
        // 广播给房间内其他用户
        room.users.forEach((userWs, id) => {
          if (id !== userId && userWs.readyState === 1) { // 1 = OPEN
            userWs.send(JSON.stringify({
              type: 'message',
              data: chatMessage
            }));
          }
        });
      } catch (e) {
        console.error('Message processing error:', e);
      }
    });
  
    ws.on('close', () => {
      room.users.delete(userId);
      console.log(`User ${userId} left room ${roomId}`);
  
      // 房间空置时启动清理定时
      if (room.users.size === 0) {
        roomManager.scheduleCleanup(roomId);
      }
    });
  
    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  });
};
module.exports = wsHandler