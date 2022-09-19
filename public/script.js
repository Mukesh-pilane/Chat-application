const socket = io()


let name = document.querySelector("#userName").textContent;
let room = document.querySelector("#groupName").textContent
;

let orignalHieght= window.innerHeight;
let textarea = document.querySelector('#textarea')
let messageArea = document.querySelector('.message__area')
let chatSection= document.querySelector('.chat__section')

let stickers = document.querySelector('.stickerpad');




document.querySelector(":root").style.setProperty("--msgaheight",`92vh`);
window.onresize = dimensions;

//dinamic hieght generator
function dimensions(){
let stickerpadHeight;
let dynamicHeight=window.innerHeight
if(dynamicHeight!=orignalHieght){
  stickerpadHeight=orignalHieght - dynamicHeight;
  document.querySelector(":root").style.setProperty("--height",`${stickerpadHeight}px`)
}
}
console.log(window.innerHeight, window.innerWidth)

let userinfo ={
  user:name,
  room:room
}

socket.emit('userroom', userinfo);

socket.on('userroom', info =>{
  let joined= document.createElement("p");
  joined.innerHTML=`<p>${info.user} as joined the chat</p>`
  joined.classList.add("joiner")
  messageArea.appendChild(joined)
  scrollToBottom()
});

function leave(){
socket.emit('leave', userinfo)
}

socket.on("userleft", info =>{
  console.log(info)
  let joined= document.createElement("p");
  joined.innerHTML=`<p>${info.user} as left the chat</p>`
  joined.classList.add("joiner")
  messageArea.appendChild(joined)
  scrollToBottom()
})

textarea.addEventListener("keyup", (e) => {
  if(e.key==="Enter"){
    
    sendMessage({msg:e.target.value,src:""})
  }
})

function send(){
  sendMessage({msg: textarea.value,src:""});
}

function sendMessage(message){
  let msg={
    room:room,
    user:name,
    message:message.msg.trim("" ),
    src:message.src
  }
  console.log(msg.message)
  appendMessage(msg, "outgoing")
  textarea.value = ''
  scrollToBottom()
  
  socket.emit('message', msg)
}

function appendMessage(msg, type){
  let mainDiv = document.createElement("div")
  let className = type
  mainDiv.classList.add(className, 'messages')
  let markup;
  if(type=="outgoing"){
  markup =  `<a style="word-wrap: break-word;white-space:pre-wrap;">${msg.message}</a>
    <img style ="width:150px;" src="${msg.src}"/>`
  }else{
    markup =`<h1>${msg.user}</h1>
  <a style="word-wrap: break-word;white-space:pre-wrap;">${msg.message}</a>
   <img style ="width:150px;" src="${msg.src}"/>`
  }
  
  mainDiv.innerHTML=markup;
  messageArea.appendChild(mainDiv)
}

socket.on('message', msg => {
    appendMessage(msg, 'incoming')
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
      //nochats
    }
});

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}

/*((((((((((((((((((Stikerpad))))))))))))))))))))*/

function hider(){
  stickers.classList.add("d-none");
  document.querySelector(":root").style.setProperty("--msgaheight",`95vh`);
}

function stickpad(){
 
  setTimeout(function() {
     let x= parseInt(document.querySelector(":root").style.getPropertyValue("--height").substring(0,3));
  y= orignalHieght - x;
    stickers.classList.remove("d-none");
    document.querySelector(":root").style.setProperty("--msgaheight",`${y}px`);
  }, 100);
  
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
