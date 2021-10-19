const redis = require('redis');
require('dotenv').config();

const clientRedis = () => {
 return redis.createClient({
  host: `${process.env.REDIS_HOST}`,
  port: `${process.env.REDIS_PORT}`,
  password: `${process.env.REDIS_PASSWORD}`
});

};
module.exports = { clientRedis };
