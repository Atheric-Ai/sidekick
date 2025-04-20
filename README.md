# Sidekick for YouTube

A Chrome extension that helps you save time by generating AI-powered summaries of YouTube videos directly in your browser. No more sitting through long videos with excessive filler content!

## Features

- **One-Click Summarization**: Right-click any YouTube video and select "Summarize Video" to generate a concise summary
- **Smart Navigation**: Works on homepage, video pages, and recommended videos
- **Sidebar Display**: Summaries appear in a non-intrusive sidebar that preserves your viewing experience
- **Download Options**: Save the summary, transcript, or both with a single click
- **Multiple LLM Providers**: Choose between Anthropic Claude or Google Gemini for summarization
- **Clean UI**: Toggle-able sidebar that maintains state during navigation

## Installation

1. Clone this repository or download it as a ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files

## Configuration

Before using the extension, you'll need to:

1. Click the extension icon in your browser toolbar
2. Select your preferred LLM provider (Anthropic Claude or Google Gemini)
3. Enter your API key for the selected provider
4. Save your settings

You can get API keys from:
- Anthropic Claude: https://console.anthropic.com/
- Google Gemini: https://makersuite.google.com/app/apikey

## Usage

1. Navigate to any YouTube video or find a video on the homepage
2. Right-click on the video or thumbnail
3. Select "Summarize Video" from the context menu
4. Wait for the summary to appear in the sidebar
5. Use the toggle button (◄) to show/hide the sidebar
6. Use the download buttons to save the transcript, summary, or both

## Project Structure

```
├── manifest.json           # Extension configuration
├── background.js          # Background script for context menu
├── content-script.js      # Main content script for YouTube integration
├── utils/
│   ├── llm-providers.js   # LLM provider implementations
│   └── transcript-extractor.js  # YouTube transcript extraction
├── styles/
│   └── sidebar.css        # Styles for the summary sidebar
├── popup/
│   ├── popup.html        # Settings popup interface
│   ├── popup.css         # Popup styles
│   └── popup.js          # Settings management
└── icons/                # Extension icons
```

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for:
- Current project status
- Working features
- Known issues
- Pending improvements
- Development roadmap

To modify or enhance the extension:

1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes on YouTube

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 