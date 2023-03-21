
console.log('general.js loaded');
const socket = io();
let config = {};
let selectedBot = 'All';
let botIGNs = [];


function updateInputFields() {
  document.getElementById('server-address').value = config.serverAddress;
  document.getElementById('version').value = config.version;
  document.getElementById('throttling-delay').value = config.throttlingDelay;
  document.getElementById('connect-message').value = config.connectMessage;
  document.getElementById('auto-reconnect').checked = config.autoReconnect;
  document.getElementById('max-retries').value = config.maxRetries;
  document.getElementById('connect-message-checkbox').checked = config.connectMessageEnabled;
  document.getElementById('number-of-bots').value = config.numberOfBots;
  updateStartStopButtonText();
}

const myButton = document.getElementById('start-stop');

socket.on('updateButtonName', (newName) => {
  myButton.textContent = newName;
});


socket.on('initialConfig', (initialConfig) => {
  config = initialConfig;
  updateInputFields();
});


function saveConfig() {
  config.serverAddress = document.getElementById('server-address').value;
  config.version = document.getElementById('version').value;
  config.throttlingDelay = parseInt(document.getElementById('throttling-delay').value, 10);
  config.connectMessage = document.getElementById('connect-message').value;
  config.autoReconnect = document.getElementById('auto-reconnect').checked;
  config.maxRetries = parseInt(document.getElementById('max-retries').value, 10);
  config.connectMessageEnabled = document.getElementById('connect-message-checkbox').checked;
  config.numberOfBots = parseInt(document.getElementById('number-of-bots').value, 10);

  socket.emit('updateConfig', config);
}

function toggleBot() {
  console.log('Start/stop button clicked');
  const serverAddress = document.getElementById('server-address').value;
  const version = document.getElementById('version').value;
  const throttlingDelay = parseInt(document.getElementById('throttling-delay').value, 10);
  const connectMessage = document.getElementById('connect-message').value;
  const autoReconnect = document.getElementById('auto-reconnect').checked;
  const maxRetries = parseInt(document.getElementById('max-retries').value, 10);
  const connectMessageEnabled = document.getElementById('connect-message-checkbox').checked;
  const numberOfBots = parseInt(document.getElementById('number-of-bots').value, 10);

  const newConfig = {
    serverAddress,
    version,
    throttlingDelay,
    connectMessage,
    autoReconnect,
    maxRetries,
    connectMessageEnabled,
    numberOfBots,
  };

  config = newConfig;

  socket.emit('updateConfig', newConfig);

  socket.emit('toggleBot', { ...newConfig, botRunning: !config.botRunning });
}

document.getElementById('start-stop').addEventListener('click', toggleBot);

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendMessage = document.getElementById('send-message');

function changeSelectedBot() {
  const botSelector = document.getElementById('bot-selector');
  selectedBot = botSelector.value;
}

socket.on('botsStarted', (bots) => {
  const botSelector = document.getElementById('bot-selector');
  
  // Remove all options except "All"
  while (botSelector.options.length > 1) {
    botSelector.remove(1);
  }

  bots.forEach((bot) => {
    const newOption = document.createElement('option');
    newOption.value = bot.username;
    newOption.textContent = bot.username;
    botSelector.appendChild(newOption);
  });
});

socket.on('chat', ({ data }) => {
  const botUsername = data.username;
  const message = data.message;
  const shouldDisplayMessage = selectedBot.toLowerCase() === 'all' || botUsername.toLowerCase() === selectedBot.toLowerCase();
  if (shouldDisplayMessage) {
    const newMessage = document.createElement('li');
    newMessage.textContent = `${botUsername} > ${message}`;
    chatMessages.appendChild(newMessage);
    trimChatMessages();
  }
});

chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage.click();
  }
});

function sendChatJS() {
  const message = chatInput.value;
  if (message) {
    socket.emit('sendChatMessage', { message, selectedBot });
    chatInput.value = '';
    console.log("emitting sendChatMessage");
  }
}

document.getElementById('send-message').addEventListener('click', sendChatJS);

function trimChatMessages() {
  const maxMessages = 200;
  while (chatMessages.childElementCount > maxMessages) {
    chatMessages.removeChild(chatMessages.firstChild);
  }
}

// Listen to changes in the bot selector
document.getElementById('bot-selector').addEventListener('change', changeSelectedBot);


socket.on('botSpawned', (username) => {
  botIGNs.push(username);
});

document.getElementById('refresh-bot-list').addEventListener('click', refreshBotList);

function refreshBotList() {
  console.log('Button pressed');
  const botSelector = document.getElementById('bot-selector');

  // Remove all options except "All"
  while (botSelector.options.length > 1) {
    botSelector.remove(1);
  }

  for (let i = 0; i < botIGNs.length; i++) {
    console.log(botIGNs[i]);

    const newOption = document.createElement('option');
    newOption.value = botIGNs[i];
    newOption.textContent = botIGNs[i];
    botSelector.appendChild(newOption);
  }
}


socket.on('authFileChange', (data) => {
  const authDataElement = document.getElementById('auth-data');
  authDataElement.textContent = data;
});
