const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const fs = require('fs');
const { fork } = require('child_process');

fs.writeFileSync('auth.txt', '', 'utf-8');

// Watch for changes in auth.txt file
fs.watch('auth.txt', (eventType, filename) => {
  if (eventType === 'change') {
    fs.readFile('auth.txt', 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading auth.txt:', err);
        return;
      }
      // Send the new data to the clients
      io.emit('authFileChange', data);
    });
  }
});


let i = 2;
let botCount = 1;
function readConfig() {
  try {
    const rawData = fs.readFileSync('config.json', 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading config.json:', error);
    return null;
  }
}

function updateConfig(newConfig) {
  try {
    const jsonData = JSON.stringify(newConfig, null, 2);
    fs.writeFileSync('config.json', jsonData, 'utf-8');
  } catch (error) {
    console.error('Error updating config.json:', error);
  }
}

function startBot(username, host, port, version) {
  const child = fork('./child.js', [username, host, port, version]);

  child.username = username; // Store the username in the child object

  child.on('message', (message) => {
    console.log('Message from child:', message);
    io.emit('chat', { data: { username: child.username, message: message } });
  
    // Handle the 'spawned' event from child process
    if (message.type === 'spawned') {
      io.emit('botSpawned', message.username);
    }
  });

  return child;
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/general', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'general.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.get('/botting', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'botting.html'));
});

io.on('connection', (socket) => {
  console.log('A user connected');

  const config = readConfig();
  if (config) {
    socket.emit('initialConfig', config);
  }

  socket.on('updateConfig', (newConfig) => {
    updateConfig(newConfig);
  });

  socket.on('sendChatMessage', ({ message, selectedBot }) => {
    // Find the selected bot or use 'All' bots
    const filteredBots = selectedBot === 'All' ? bots : bots.filter(bot => bot.username === selectedBot);
  
    // Send the message to each bot in the selected bots
    filteredBots.forEach(bot => {
      bot.send({ type: 'chat', message });
      console.log(bot + 'is sending: ' + message)
    });
  });

  socket.on('toggleBot', (data) => {
    const {
      serverAddress,
      version,
      connectMessage,
      connectMessageEnabled,
      numberOfBots,
    } = data;
    botCount = numberOfBots;
  
    if (i % 2 == 0) {
      i++;
      socket.emit('updateButtonName', 'Stop');
      console.log("Bots started through web gui");
  
      const config = readConfig();
      reconnectBot(serverAddress, version, config);
  
    } else {
      i++;
      socket.emit('updateButtonName', 'Start');
      console.log("Bots stopped through web gui");
      stopBots();
    }
  });
  
});

const bots = [];

const reconnectBot = (serverAddress, version, config) => {
  bots.length = 0;

  const createAndStartBot = (index) => {
    const username = `Bot${index}`;
    const bot = startBot(username, serverAddress, 25565, version);
    bots.push(bot);
  };

  const startBotsWithDelay = (index, numberOfBots, delay) => {
    if (index < numberOfBots) {
      createAndStartBot(index);
      setTimeout(() => {
        startBotsWithDelay(index + 1, numberOfBots, delay);
      }, delay);
    } else {
      // Emit an event with the list of bot usernames
      io.emit('botsStarted', bots.map((bot) => ({username: bot.username})));

    }
  };

  startBotsWithDelay(0, botCount, config.throttlingDelay);
};

const stopBots = () => {
  bots.forEach((bot) => {
    bot.send({ action: 'stop' });
  });
};

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = io;