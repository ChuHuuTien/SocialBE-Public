# Social BE - NodeJs

## Cách chạy

npm install.
npm start.

Chạy trên cổng 3001.

## Api

Public API: https://socialbe-gbu6.onrender.com/

### Auth `/auth`

-   `[POST] /login`: login.
    -   body: {email: String, password: String}.
    -   result: {message: String, accessToken: String, refreshToken: String user: {userid: String, email: String}}.
-   `[POST] /refresh`: refresh token.
    -   body: {accessToken: String, refreshToken: String}.
    -   result: {accessToken: String}.
-   `[POST] /register`: đăng ký.
    -   body: {email: String, firstName: String, lastName: String, password: String}.
    -   result: {email: String}.
-   `[POST] /sendotp`: Gửi otp tới email.
    -   body: {email: String}.
    -   result: {message: String, email: String}.
-   `[POST] /verifyotp`: verify otp.
    -   body: {email: String, otp: String}.
    -   result: {success: String, message: String}.
-   `[POST] /reset`: reset password.
    -   body: {oldPassword: String, newPassword: String}.
    -   result: {message: String}.

### User `/user`

-   `[GET] /info`: get thông tin user theo id.
    -   query: {id: String}.
    -   result: {
        message: String, 
        user: {
            _id: String, 
            firstName: String, 
            lastName: String, 
            email: String, 
            friends: [{
                _id: String, 
                firstName: String, 
                lastName: String, 
                avatar: String
                }], 
            adress: String, 
            avatar: String
        }}.
-   `[GET] /all`: get tất cả người dùng.
    -   result: {
        message: String, 
        users: [{
            _id: String, 
            firstName: String, 
            lastName: String, 
            avatar: String
            }]
        }.

-   `[DELETE] /delete`: xoá người dùng theo id.
    -   query: {id: String}
    -   result: {
        message: String, 
        }.

-    `[GET] /listfollow`: get danh sách follow
    -   body: listId (String), page (int) , limit(int)
    -   result: { 
        users: 
            { users: 
                [_id: String, 
                firstName: String, l
                astName: String, 
                avatar: String
                ]}
            }.
-   `[POST] /follow`: cập nhật danh sách follow.
    -   body: {friendId: String, userId: String}.
    -   result: {message: String, user: [{}]}.
-   `[POST] /updateuser`: cập nhật thông tin user.
    -   body: {
            firstName: String, 
            lastName: String, 
            avatar: String,
            adress: String
            }.
    -   result: {message: String, user: {}}.
-   `[POST] /resetpass`: reset password.
    -   body: {oldPassword: String, newPassword: String}.
    -   result: {message: String, user: {}}.    

### Post `/post`.

- `[GET] /news?page=&limit=`: get những bài viết mới nhất.
    -   result: { 
            new: [
                {
                    _id: String,
                    creatorId: String,
                    content: String,
                    imageSrcs: [],
                    commentLength: Number,
                    createdAt: Date,
                    postedByUser: {
                        _id: String,
                        firstName: String,
                        lastName: String,
                        avatar: String
                    },
                    likesByUsers: [{
                        _id: String,
                        firstName: String,
                        lastName: String
                        }
                    ]
                }
            ]
        }
`[GET] /all/:userid?page=&limit=`: get những bài viết theo userid
    -   params: { userid: String }
    -   result: { 
            message: String,
            posts: [
                {
                    _id: String,
                    creatorId: String,
                    content: String,
                    imageSrcs: [],
                    commentLength: Number,
                    createdAt: Date,
                    postedByUser: {
                        _id: String,
                        firstName: String,
                        lastName: String,
                        avatar: String
                    },
                    likesByUsers: [{
                        _id: String,
                        firstName: String,
                        lastName: String
                        }
                    ]
                }
            ]
        }
`[GET] /:postid?page=&limit=`: get bài viết theo postid
    -   params: { postid: String }
    -   result: { 
            message: String,
            post: {
                    _id: String,
                    creatorId: String,
                    content: String,
                    imageSrcs: [],
                    commentLength: Number,
                    createdAt: Date,
                    postedByUser: {
                        _id: String,
                        firstName: String,
                        lastName: String,
                        avatar: String
                    },
                    likesByUsers: [{
                        _id: String,
                        firstName: String,
                        lastName: String
                        }
                    ]
            },
            comments: [
                {
                    _id: String,
                    postId: String,
                    creatorId: String,
                    content: String,
                    createdAt: Date,
                    commentByUser: {
                        _id: String,
                        firstName: String,
                        lastName: String,
                        avatar: String
                    }
                }
            ]
        }
`[GET] /:postid/comments`: get bình luận theo postid
    -   params: { postid: String }
    -   result: {
            comments: [
                {
                    _id: String,
                    postId: String,
                    creatorId: String,
                    content: String,
                    createdAt: Date,
                    commentByUser: {
                        _id: String,
                        firstName: String,
                        lastName: String,
                        avatar: String
                    }
                }
            ]
        }
-   `[POST] /create`: Tạo bài viết mới
    -   body: {content: String, images: [String]}
    -   result: {
            post: {
                    _id: String,
                    creatorId: String,
                    content: String,
                    imageSrcs: [],
                    commentLength: Number,
                    createdAt: Date,
                    postedByUser: {
                        _id: String,
                        firstName: String,
                        lastName: String,
                        avatar: String
                    },
                    likesByUsers: [{
                        _id: String,
                        firstName: String,
                        lastName: String
                        }
                    ]
            },  
        }
-   `[POST] /update`: Cập nhật bài viết
    -   body: {postid: String, content: String}
    -   result: {
            message: String,
            post: {
                    _id: String,
                    creatorId: String,
                    content: String,
                    imageSrcs: [],
                    commentLength: Number,
                    createdAt: Date,
                    postedByUser: {
                        _id: String,
                        firstName: String,
                        lastName: String,
                        avatar: String
                    },
                    likesByUsers: [{
                        _id: String,
                        firstName: String,
                        lastName: String
                        }
                    ]
            },  
        }
-   `[POST] /like`: Thích bài viết
    -   body: {postid: String }
    -   result: {
            status: String,
            post: {
                    _id: String,
                    creatorId: String,
                    content: String,
                    imageSrcs: [],
                    commentLength: Number,
                    createdAt: Date,
                    postedByUser: {
                        _id: String,
                        firstName: String,
                        lastName: String,
                        avatar: String
                    },
                    likesByUsers: [{
                        _id: String,
                        firstName: String,
                        lastName: String
                        }
                    ]
            },  
        }
-   `[POST] /:postid/comment`: Bình luận vào bài viết theo postid.
    -   params: {postid: String}
    -   body: {comment: String}.
    -   result: {
            comments: {
                    _id: String,
                    postId: String,
                    creatorId: String,
                    content: String,
                    createdAt: Date,
                    commentByUser: {
                        _id: String,
                        firstName: String,
                        lastName: String,
                        avatar: String
                    }
                }    
        }
-   `[DELETE] /:postid`: Xoá post.
    -   params: { postid: String }
    -   result: { message: String }
-   `[DELETE] /:commentid/comment`: Xoá bình luận
    -   params: { commentid: String }
    -   result: { message: String }
### Room `/room`.

-   `[GET] /`: danh sách các cuộc trò chuyện gần đây.
    -   result: { 
            success: String,
            conversation: [{
                _id: String,
                type: String,
                chatInitiator: String,
                groupName: String,
                users: [
                    {
                        _id: String,
                        firstName: String,
                        lastName: String,
                        avatar: String
                    }
                ]
            }]    
    }

-   `[GET] /all`: danh sách các phòng.
    -   result: { 
            success: String,
            rooms: [{
                _id: String,
                userIds: [String],
                type: private,
                chatInitiator: String,
                groupName: String,
                createdAt: Date,
                updatedAt: Date
            }]    
    }

-   `[GET] /:roomId`: Tìm phòng theo roomid.
    -   params: { roomid: String}
    -   result: { 
            success: String,
            conversation: [{
                _id: String,
                chatRoomId: String,
                postedByUser: {
                    _id: String,
                    firstName: String,
                    lastName: String,
                    avatar: String
                },
                message: {
                    messageText: String
                },
                type: String,
                createdAt: Date
            }]    
    }
-   `[POST] /initate`: Tạo phòng mới.
    -   params: {postid: String}
    -   body: { userIds: [String] }.
    -   result: {
            success: String,
            chatRoom: {
                _id: String,
                userIds: [String],
                type: private,
                chatInitiator: String,
                groupName: String,
                createdAt: Date,
                updatedAt: Date
            }    
        }
-   `[POST] /:roomId/message`: Tạo tin nhắn trong phòng.
    -   params: {postid: String}
    -   body: { messageText: String }.
    -   result: {
            success: String,
            message: {
                _id: String,
                chatRoomId: String,
                postedByUser: {
                    _id: String,
                    firstName: String,
                    lastName: String,
                    avatar: String
                },
                message: {
                    messageText: String
                },
                type: String,
                createdAt: String
            }    
        }
    -   socket: io.in(roomId).emit('new-message', message).

### Admin (hehe - lười)



## Socket Server nhận

-   socket.on('identity', (userId) => {
        usersOnline.push({
          socketId: socket.id,
          userId: userId,
        });
    });

-   socket.on("subscribe", (room) => {
        console.log("user: "+socket.id +" join room: "+ room);
        socket.join(room);
      });

-   socket.on("unsubscribe", (room) => {
        console.log("user: "+socket.id +" leave room: "+ room);
        socket.leave(room);
      });

-   socket.on("send-msg", (data) => {
        const chatRoomSocket = data.chatRoomId;
        if (chatRoomSocket) {
          socket.to(chatRoomSocket).emit("msg-recieve", data);
        }
    });

-   socket.on("disconnect", () => {
        usersOnline = usersOnline.filter((user) => user.socketId !== socket.id);
      });

-   socket.on('typing', (conversationId, me) => {
    socket.broadcast.to(conversationId).emit('typing', conversationId, me);
    });
-   socket.on('not-typing', (conversationId, me) => {
    socket.broadcast.to(conversationId).emit('not-typing', conversationId, me);
    });
-   socket.on('get-user-online', (userId, ({isOnline, lastLogin}) => {} ))

### Chưa có tính năng này
-   socket.on('conversation-last-view', (conversationId, channelId) => {}): để cập nhật lại last view của mình ở conversation hoặc channel đó (nếu là channel thì phải truyền cả 2 tham số).

## Socket Server trả về

### Chưa có tính năng này
-  socket.emit('user-last-view', {conversationId, channelId, userId, lastView: Date } ): user đã xem tin nhắn ở conversation hoặc channel.
