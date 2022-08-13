//node index
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

app.get(/icon/, (req, res) => {
  res.sendFile(`${__dirname}/${req.path}`);
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
  res.status(404).sendFile(__dirname + '/public/404.html');
});

var x0 = []
var y0 = []
var x1 = []
var y1 = []
var color = []
var action = []


function onConnection(socket){
  socket.on('drawing', (data)=>{
    socket.broadcast.emit('drawing', data);
    x0.push(data.x0)
    y0.push(data.y0)
    x1.push(data.x1)
    y1.push(data.y1)
    color.push(data.color)
    action.push(data.action)
    console.log("[POST] data")

})

socket.on("getData",function(){

  
  io.to(socket.id).emit("getData",{'x0':x0,'y0':y0,'x1':x1,'y1':y1,'color':color,'action':action})
  console.log("[GET] data")
})
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
