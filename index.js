//node index
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

app.get(/icon|canvas|public/, (req, res) => {
  res.sendFile(`${__dirname}/${req.path}`);
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
  res.status(404).sendFile(__dirname + '/public/404.html');
});


var cvsdata = []


function onConnection(socket){
  socket.on('drawing', (data)=>{
    socket.broadcast.emit('drawing', data);
   cvsdata.push({
    "action":data.action,
    "x0":data.x0,
    "x1":data.x1,
    "y0":data.y0,
    "y1":data.y1,
    "size":data.size,
    "color":data.color})

})

socket.on("getData",function(){

  
  io.to(socket.id).emit("getData",cvsdata)
  console.log("[GET] data")
})
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
