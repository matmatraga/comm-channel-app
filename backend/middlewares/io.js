const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const { verifyToken } = require('./auth');

module.exports = (io) => {
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        try{
            const user = jwt.verify(token, process.env.JWT_SECRET);
            const fetchUser = await User.findById(user.id).select('-password -__v');
            socket.user = fetchUser;
            next();
        }catch{
            return next(new Error('Authentication error'));
        }
    });

    io.on('connection', socket => {
        console.log(`User connected: ${socket.user.name}`);

        socket.on('private_message', async({to, content}) => {
            const chat = await Chat.create({
                sender: socket.user.id,
                receiver: to,
                message: content.message,
                file: content.file || null
            });

            const payload = {
                from: socket.user,
                content: chat.message,
                file: chat.file,
                timestamp: chat.createdAt
            };

            for (const [id, s] of io.of('/').sockets) {
                if (s.user.id === to || s.user.id === socket.user.id) {
                    s.emit('private_message', payload);
                
                }
            }
        })
    })
}