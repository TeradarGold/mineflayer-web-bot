// Connect to socket.io server
const socket = io();

// Listen for the initial config
socket.on('initialConfig', (config) => {
  // Update the input fields with the values from config
  document.getElementById('server-address').value = config.serverAddress;
  document.getElementById('version').value = config.version;
  // Add other config values as needed
});

// Function to emit the updateConfig event when the user updates the settings
function saveConfig() {
  const serverAddress = document.getElementById('server-address').value;
  const version = document.getElementById('version').value;
  const throttlingDelay = parseInt(document.getElementById('throttling-delay').value, 10);
  const connectMessage = document.getElementById('connect-message').value;
  const autoReconnect = document.getElementById('auto-reconnect').checked;
  const maxRetries = parseInt(document.getElementById('max-retries').value, 10);
  const connectMessageEnabled = document.getElementById('connect-message-checkbox').checked;

  const newConfig = {
    serverAddress,
    version,
    throttlingDelay,
    connectMessage,
    autoReconnect,
    maxRetries,
    connectMessageEnabled,
  };

  // Emit the updateConfig event with the new config
  socket.emit('updateConfig', newConfig);
}

// Function to start or stop the bot
function toggleBot() {
  const newConfig = {
    serverAddress: document.getElementById('server-address').value,
    version: document.getElementById('version').value,
    // Add other config values as needed
  };

  console.log('Emitting toggleBot event with data:', { ...newConfig, botRunning: !config.botRunning });
  socket.emit('toggleBot', { ...newConfig, botRunning: !config.botRunning });
}

