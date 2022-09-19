const express = require('express')
const app = express()
const http = require('http').createServer(app)
const mongoose = require('mongoose')
const session = require('express-session') ;
const bodyparser = require('body-parser')
require('dotenv').config()


app.use(session({ 
    secret: 'not a secret',
    resave: true,
    saveUninitialized: true
}))

//middleware

app.set('view engine', 'ejs')

app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())

//mongodb connection and Schema
mongoose.connect(process.env.MONGODB_URI, err => {
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
const PORT = process.env.PORT || 3000;

app.set("port", PORT)
http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

app.use(express.static(__dirname + '/public'))

//routes
app.get('/room', (req, res) => {
    !req.session.user?res.redirect('join'):res.render("index", {user:req.session.user, room:req.session.room})
})

app.get('/', (req, res) =>{
  !req.session.user?res.render("join"):res.redirect('/room')
})

app.post('/lobby', (req, res) => {
  room = req.body.room;
  name = req.body.userName;
  req.session.user = name;
  req.session.room = room;
  res.redirect("/room");
});

app.get('/logout', function(req, res){
  req.session.user&&req.session.destroy();
  res.redirect('/')
})

app.get('*', function(req, res){
  res.render('error');
});

// Socket connection
const io = require('socket.io')(http)


io.on('connection', socket => {
    console.log('Connected...')
  //join notifiction data sender
  let Room;
  socket.on("userroom", userinfo => {
    socket.join(userinfo.room)
    Room = userinfo.room;
    socket.broadcast.to(Room).emit('userroom', userinfo);
  })
  
  //leaving notifiction data sender
  socket.on("leave", userinfo =>{
    socket.leave(userinfo.room);
    socket.broadcast.to(userinfo.room).emit("userleft", userinfo);
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
       socket.broadcast.to(msg.room).emit('message', msg);
       const message = new Message(
         msg
       );
       message.save()
   })

})
