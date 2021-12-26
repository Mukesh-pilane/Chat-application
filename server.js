const express = require('express')
const app = express()
const http = require('http').createServer(app)
const mongoose = require('mongoose')
const URL ="mongodb+srv://mukeshpilane:123mukesh@cluster0.ut91y.mongodb.net/friendslog?retryWrites=true&w=majority"


//mongodb connection and Schema
mongoose.connect(URL, err => {
  if(!err){
    console.log("Connected")
  }else{
    console.log(err)
  }
});

const messageSchema = mongoose.Schema({
  room:String,
  user: String,
  message:String,
  src:String
}
  );
const Message = mongoose.model('Message', messageSchema);


//Server connection
const PORT = process.env.PORT || 3000

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

app.use(express.static(__dirname + '/public'))

//routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

// Socket connection
const io = require('socket.io')(http)


io.on('connection', socket => {
    console.log('Connected...')
  //join notifiction data sender
  let Room;
  socket.on("join", userinfo => {
    socket.join(userinfo.room)
    console.log(socket.join)
    Room = userinfo.room;
    socket.broadcast.to(Room).emit('join', userinfo);
  })

// sending saved message 
Message.find({},(err,data)=> {
      if(!err){
    socket.emit('saved-message', data);
      }else{
        console.log(err)
      }
    });

    
  // sending current message
    socket.on('message',  msg => {
       socket.broadcast.to(Room).emit('message', msg);
       const message = new Message(
         msg
       );
       message.save()
   })

})
