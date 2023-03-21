// child.js
const mineflayer = require('mineflayer');
const { createBot } = require('mineflayer');

// Get arguments
const username = process.argv[2];
const host = process.argv[3];
const port = parseInt(process.argv[4], 10);
const version = process.argv[5];

const bot = createBot({
  username: username,
  host: host,
  port: port,
  version: version,
  auth: 'microsoft',
});

bot.on('spawn', function () {
  console.log(` >> ${bot.username} has spawned..`);
  process.send({ type: 'spawned', username: bot.username });
});

bot.on('kicked', console.log);
bot.on('error', console.log);

bot.on('chat', (username, message) => {
  console.log(`${username}: ${message}`);
  process.send(`${bot.username} > ${username}: ${message}`);
});

process.on('message', (data) => {
  if (data.type === 'chat') {
    bot.chat(data.message);
  }
  if (data.action === 'stop') {
    bot.end();
  }
});
