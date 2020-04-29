const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const { generateMessage } = require('./utils/message')
const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/userStore')

const port = process.env.PORT || 3000
const publicPath = path.join(__dirname,'/public')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

//paths
app.use(express.static(publicPath))

//websocket
io.on('connection', (socket) => {
    console.log("New User Connected!")
    //Join 
    socket.on('join',(options,callback) => {
        const { error,user } = addUser({id: socket.id, ...options }) 
        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('msgToAll', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('msgToAll',generateMessage(`${user.userName} has joined the room.`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
    
    socket.on('message',(msg) => {
        const user = getUser(socket.id);
        const uName = user.userName;
        io.to(user.room).emit('msgToAll',(generateMessage(user.userName, msg)));
    })
   
    //User Joining Message
   
    //Location Sharing
    socket.on('coords',(obj) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('gMapsURL', generateMessage(`https://www.google.com/maps?q=${obj.latitude},${obj.longitude}`))
    })

    //User Left Message
    socket.on('disconnect',() => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('msgToAll',generateMessage(user.userName,' has left the chat!'))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });
})

server.listen(port, () => console.log(`Server is running on :${port}`))