const WebSockets = (socket)=>{
    {
      
      console.log('user disconnected: '+socket.id);
      
      socket.on("disconnect", () => {
        usersOnline = usersOnline.filter((user) => user.socketId !== socket.id);
      });
  
      socket.on("identity", (userId) => {
        console.log('New user connected: '+socket.id)
        usersOnline.push({
          socketId: socket.id,
          userId: userId,
        });
      });
  
      socket.on("send-msg", (data) => {
        const chatRoomSocket = data.chatRoomId;
        if (chatRoomSocket) {
          socket.to(chatRoomSocket).emit("msg-recieve", data);
        }
      });
  
      socket.on("subscribe", (room) => {
        console.log("user: "+socket.id +" join room: "+ room);
        socket.join(room);
      });
      // mute a chat room
      socket.on("unsubscribe", (room) => {
        console.log("user: "+socket.id +" leave room: "+ room);
        socket.leave(room);
      });

      socket.on('typing', (room, me) => {
        socket.broadcast.to(room).emit('typing', room, me);
        });

      socket.on('not-typing', (room, me) => {
        socket.broadcast.to(room).emit('not-typing', room, me);
        });
    }
}

module.exports = WebSockets;