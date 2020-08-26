require('dotenv').config();
const { PORT } = process.env;
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const game = new (require('./game'))(io);

io.on('connection', require('./client')(game));

http.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`);
});
