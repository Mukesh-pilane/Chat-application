const socket = io()


let name;
let room;
let orignalHieght= window.innerHeight;
let textarea = document.querySelector('#textarea')
let messageArea = document.querySelector('.message__area')
let body = document.querySelector('.chat__section')
let stickers = document.querySelector('.stickerpad');
do{
  name= prompt("Please Enter Ur Name")
}while(!name)
do{
  room= prompt("Room name")
}while(!room )
window.onresize = dimensions;

function dimensions(){

let stickerpadHeight;
let dynamicHeight=window.innerHeight
if(dynamicHeight!=orignalHieght){
  stickerpadHeight=orignalHieght - dynamicHeight;
  document.querySelector(":root").style.setProperty("--height",`${stickerpadHeight}px`)
}
}

let userinfo ={
  user:name,
  room:room
}

socket.emit('join', userinfo);


textarea.addEventListener("keyup", (e) => {
  if(e.key==="Enter"){
    sendMessage({msg:e.target.value,src:""})
  }
})

function send(){
  sendMessage({msg: textarea.value,src:""});
  textarea.setAttribute("autofocus", "true");
  $("textarea").trigger("focus")
}

function sendMessage(message){
  let msg={
    room:room,
    user:name,
    message:message.msg.trim(),
    src:message.src
  }
  appendMessage(msg, "outgoing")
  textarea.value = ''
  scrollToBottom()
  
  socket.emit('message', msg)
}

function appendMessage(msg, type){
  let mainDiv = document.createElement("div")
  let className = type
  mainDiv.classList.add(className, 'messages')
  let markup =`<h1>${msg.user}</h1><p>${msg.message}</p>
  <img src="${msg.src}"/>`
  if(type=="outgoing"){
    markup = `
   <h1>You</h1>
   <p>${msg.message}</p>
   <img src="${msg.src}"/>
  `
  
  }
  
  mainDiv.innerHTML=markup
  
  messageArea.appendChild(mainDiv)
}

socket.on('message', msg => {
    appendMessage(msg, 'incoming')
    scrollToBottom()
});

socket.on('join', info =>{
  let joined= document.createElement("p");
  joined.innerHTML=`<p>${info.user} as joined the chat</p>`
  joined.classList.add("joiner")
  messageArea.appendChild(joined)
  scrollToBottom()
});



socket.on('saved-message', (data) => {
    if(data.length){
      data.forEach(msg =>{
        if(msg.user!= name && msg.room == room){
      appendMessage(msg, 'incoming')
      scrollToBottom()
        }else if(msg.room == room){
         appendMessage(msg, 'outgoing')
         scrollToBottom()
        }
     })
scrollToBottom()
    }else{
      console.log("no chats")
    }
});

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}

function hider(){
  stickers.classList.add("d-none");
}

function stickpad(){
 stickers.classList.remove("d-none");
}

var sticker = document.querySelectorAll(".sticker");
for(var i = 0; i < sticker.length; i++){
  sticker[i].addEventListener("click", function (){
  sendMessage({msg:"", src:this.getAttribute('src')})
    
  });
}

/*document.querySelectorAll(".sticker").forEach((stickers) => {
  stickers.addEventListener("click", () => {
  console.log(this)
})

});*/
