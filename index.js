var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
const redis = require('redis');
require('dotenv').config();



var io = require('socket.io')(server);

const client = redis.createClient({
  host: `${process.env.REDIS_HOST}`,
  port: `${process.env.REDIS_PORT}`,
  password: `${process.env.REDIS_PASSWORD}`
});

client.on('error', err => {
  console.log('Erro ao conectar no redis')
  console.log('Error ' + err);
});

const generateRoomId = (id1,id2) => {

  const compareResult = id1 > id2;
  if(compareResult== false){
    return id1+id2;
  }
  return id2+id1;
}

io.on('connection', async(socket) => {

  //Ouvindo evento message
  socket.on('message', async(data)=>{
    

    const message = { ...data.data, 'date': new Date()};
    console.log("mensagem recebida", JSON.stringify(message));
    //Verificar se a conversar já existe
    var roomId = message.roomId;
    if(roomId === ''){
      roomId = generateRoomId(message.userId, message.toId);
      console.log('ID da conversa', roomId);
      const newList = [JSON.stringify(message)]
      client.set(roomId, `[${newList}]`);
      console.log(JSON.stringify(`[${message}]`));
    }

    console.log(JSON.stringify(message));

  });

});



app.get('/', (req, res) => {
    res
      .status(200)
      .send('Hello, world!')
      .end();
  });

app.use(bodyParser.json());


// Start the Server
server.listen(8080);

