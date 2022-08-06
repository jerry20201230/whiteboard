
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.get(/icon/, (req, res) => {
  res.sendFile(`${__dirname}/${req.path}`);
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
  res.status(404).sendFile(__dirname + '/public/404.html');
});
function onConnection(socket){
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
