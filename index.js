var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  host: `${process.env.REDIS_HOST}`,
  port: `${process.env.REDIS_PORT}`,
  password: `${process.env.REDIS_PASSWORD}`
});

client.on('error', err => {
  console.log('Erro ao conectar no redis')
  console.log('Error ' + err);
});


var io = require('socket.io')(server);





app.get('/', (req, res) => {
    res
      .status(200)
      .send('Hello, world!')
      .end();
  });

app.use(bodyParser.json());


// Start the Server
server.listen(8080);

