const wsHandler = (app) => {
  const messageHistory = [];
  const chatRooms = {}

  app.ws('/ws/:roomId', function (ws, req) {
    const roomId = req.params.roomId;
    let openid = req.headers['x-wx-openid'] // 从header中获取用户openid信息

    if (openid == null) { // 如果不存在则不是微信侧发起的
      openid = new Date().getTime() // 使用时间戳代替
      ws.close()
      return
    }
    console.log('openid', openid)

    if (!chatRooms[roomId]) {
      chatRooms[roomId] = [];
    }

    chatRooms[roomId].push(ws);

    // 发送历史消息给新连接的客户端
    ws.send(JSON.stringify(messageHistory));

    ws.on('message', function (msg) {
      console.log('收到消息：', msg);
      const message = {
        type: 'receive',
        timestamp: new Date().toISOString(),
        user: openid,
        content: msg
      };
      messageHistory.push(message);
      chatRooms[roomId].forEach(client => {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    });

    ws.on('close', function () {
      const index = chatRooms[roomId].indexOf(ws);
      if (index > -1) {
        chatRooms[roomId].splice(index, 1);
      }
    });
  });
};
module.exports = wsHandler