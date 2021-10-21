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

const createRoomToUserIfNotExist = (userId) =>{
  client.get(userId, (err, room) => {
    if (err | room == null) {
      client.set(userId, `{}`);
    };
  });
}

const updateMyRooms = (userId, roomId, status) => {
  var myRooms;
  client.get(userId, (err, reply) => {
    if (err) throw err;
    myRooms = JSON.parse(reply);
    myRooms[`${roomId}`] = status;
    client.set(userId, `${JSON.stringify(myRooms)}`);
    console.log('conversas: ', myRooms);
  });
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
    else{
      // Pegar os dados da chave no redis e adicionar nova mensagem
      var roomData = [];
      client.get(roomId,(err, reply) => {
        if (err) throw err;
        roomData = JSON.parse(reply);
        roomData.push(message);
        //Adicionando nova mensagem a conversa
        client.set(roomId, `${JSON.stringify(roomData)}`);
        console.log('conversa: ', roomData);
      });
    }

    // Verificar se é a primeira Conversa do usuário
    createRoomToUserIfNotExist(message.toId);
    createRoomToUserIfNotExist(message.userId);
    //Adiciona status das conversas em cada chave de usuário
    updateMyRooms(message.userId, roomId, 0);
    updateMyRooms(message.toId, roomId, 1);

    //Notificar usuário sobre nova mensagem
    io.emit(message.toId, {alert: roomId});
    // console.log(JSON.stringify(message));
    //Enviando emitindo mensagem para sala(conversa)
    io.emit(roomId,message);
  });
  
  
  socket.on("disconnect", async () => {
   console.log("Um usuário se desconectou");
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

