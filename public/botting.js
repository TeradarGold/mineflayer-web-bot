document.addEventListener('DOMContentLoaded', () => {
  const bottingOption = document.getElementById('botting-option');
  const chatSettings = document.getElementById('chat-settings');
  const startCommand = document.getElementById('start-command');

  bottingOption.addEventListener('change', () => {
    if (bottingOption.value === 'chat') {
      chatSettings.style.display = 'block';
    } else {
      chatSettings.style.display = 'none';
    }
  });

  startCommand.addEventListener('click', () => {
    if (bottingOption.value === 'chat') {
      const message = document.getElementById('message').value;
      const repeat = parseInt(document.getElementById('repeat').value);
      const repeatDelay = parseInt(document.getElementById('repeat-delay').value);

      if (message && repeat && repeatDelay) {
        // Call Mineflayer function to execute chat command
      }
    } else if (bottingOption.value === 'respawn') {
      // Call Mineflayer function to execute respawn command
    }
  });
});
