// LLM Provider configurations
const LLMProviders = {
  ANTHROPIC: 'anthropic',
  GEMINI: 'gemini'
};

// Configuration for each provider
const providerConfigs = {
  [LLMProviders.ANTHROPIC]: {
    name: 'Anthropic Claude',
    maxTokens: 4096,
    async generateSummary(transcript, apiKey) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 4096,
            messages: [{
              role: 'user',
              content: `Please provide a concise summary of this video transcript, highlighting the main points and key takeaways:\n\n${transcript}`
            }]
          })
        });

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
      } catch (error) {
        console.error('Anthropic API error:', error);
        throw error;
      }
    }
  },
  [LLMProviders.GEMINI]: {
    name: 'Google Gemini',
    maxTokens: 4096,
    async generateSummary(transcript, apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Please provide a concise summary of this video transcript, highlighting the main points and key takeaways:\n\n${transcript}`
              }]
            }]
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
      }
    }
  }
};

// Get list of available providers
function getAvailableProviders() {
  return Object.values(providerConfigs).map(config => ({
    id: config.id,
    name: config.name
  }));
}

// Generate summary using selected provider
async function generateSummaryWithProvider(provider, transcript, apiKey) {
  const config = providerConfigs[provider];
  if (!config) {
    throw new Error('Invalid LLM provider');
  }
  return await config.generateSummary(transcript, apiKey);
}

export {
  LLMProviders,
  getAvailableProviders,
  generateSummaryWithProvider
}; 