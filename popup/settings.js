document.addEventListener('DOMContentLoaded', async () => {
  const providerSelect = document.getElementById('provider-select');
  const anthropicSettings = document.getElementById('anthropic-settings');
  const geminiSettings = document.getElementById('gemini-settings');
  const saveButton = document.getElementById('save-settings');
  const statusMessage = document.getElementById('status-message');

  // Load saved settings
  const settings = await chrome.storage.sync.get(['provider', 'anthropicApiKey', 'geminiApiKey']);
  
  if (settings.provider) {
    providerSelect.value = settings.provider;
  }
  
  if (settings.anthropicApiKey) {
    document.getElementById('anthropic-api-key').value = settings.anthropicApiKey;
  }
  
  if (settings.geminiApiKey) {
    document.getElementById('gemini-api-key').value = settings.geminiApiKey;
  }

  // Show/hide provider settings based on selection
  function updateProviderSettings() {
    const selectedProvider = providerSelect.value;
    anthropicSettings.style.display = selectedProvider === 'anthropic' ? 'block' : 'none';
    geminiSettings.style.display = selectedProvider === 'gemini' ? 'block' : 'none';
  }

  // Initial update
  updateProviderSettings();

  // Update on provider change
  providerSelect.addEventListener('change', updateProviderSettings);

  // Save settings
  saveButton.addEventListener('click', async () => {
    const provider = providerSelect.value;
    const anthropicApiKey = document.getElementById('anthropic-api-key').value;
    const geminiApiKey = document.getElementById('gemini-api-key').value;

    try {
      await chrome.storage.sync.set({
        provider,
        anthropicApiKey,
        geminiApiKey
      });

      statusMessage.textContent = 'Settings saved successfully!';
      statusMessage.className = 'status-message success';
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        statusMessage.style.display = 'none';
      }, 3000);
    } catch (error) {
      statusMessage.textContent = 'Error saving settings. Please try again.';
      statusMessage.className = 'status-message error';
    }
  });
}); 