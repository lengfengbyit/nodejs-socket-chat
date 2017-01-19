var express  = require('express');
var app = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var fs   = require('fs');


//托管静态模块
app.use(express.static(__dirname + '/'));


var onlineUsers = {};//在线用户
var onlineCount = 0;//在线用户数量
var userSocket = {};

io.on('connection',function(socket){

    console.log('connection success ...');

    //监听新用户加入
    socket.on('login',function(user){

        if(!onlineUsers.hasOwnProperty(user.userid)){

            onlineUsers[user.userid] = user.username;
            onlineCount++ ;

            userSocket[user.userid] = socket;
        }
        var res = {
            onlineCount:onlineCount,
            onlineUsers:onlineUsers,
            msg : user.username + '加入了房间'
        };
        io.emit('login',res);
        console.log(res.msg);
    });

    //监听用户退出
    socket.on('logout',function(user){

        if(onlineUsers.hasOwnProperty(user.userid)){

            delete onlineUsers[user.userid];
            onlineCount--;

            var res = {
                onlineCount:onlineCount,
                onlineUsers:onlineUsers,
                msg : user.username + '退出了房间'
            };

            io.emit('logout',res);
            console.log(res.msg);
        }
    });

    //监听发送消息
    socket.on('msg',function(obj){

        if(obj.toUserId > 0 && userSocket.hasOwnProperty(obj.toUserId)){

            userSocket[obj.toUserId].emit('msg',obj);
            userSocket[obj.user.userid].emit('msg',obj);
        }else{

            io.emit('msg',obj);
        }
    });
})


http.listen(3000,function(){

    console.log('listen 3000 ...');
})