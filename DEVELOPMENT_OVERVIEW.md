# Sidekick for YouTube - Development Overview

## Project Structure
This project is organized into multiple development branches to track the evolution of features and improvements:

### Branch Structure
- `main` - Contains the stable V1 prototype implementation
- `v2-prototype` - Development branch for V2 features and improvements
- `v3-prototype` - Latest development branch for ongoing feature development

## Development Timeline

### V1 Prototype (main branch)
Core implementation of YouTube video summarization with basic features:
- Chrome extension infrastructure
- Video transcript extraction
- AI summarization using multiple LLM providers (Claude/Gemini)
- Basic sidebar UI with toggle functionality
- Settings management for API keys
- Download options for transcripts/summaries

See `DEVELOPMENT_V1.md` for detailed V1 status and features.

### V2 Development (v2-prototype branch)
Building upon V1 with enhanced features and improvements:
- Improved UI/UX
- Enhanced error handling
- Performance optimizations
- Additional LLM provider support
- Extended configuration options

See `DEVELOPMENT_V2.md` for ongoing V2 development status.

### V3 Development (v3-prototype branch)
Latest development branch focusing on:
- Continuing UI/UX improvements
- Enhanced performance optimizations
- Advanced feature implementations
- Extended provider integrations

See `DEVELOPMENT_V3.md` for current development status.

## Project Goals
1. Create a seamless YouTube integration for video summarization
2. Support multiple LLM providers for flexibility
3. Provide a clean, intuitive user interface
4. Ensure reliable transcript extraction and processing
5. Maintain high performance and stability

## Development Guidelines
1. Each major version has its own development document
2. Features are tracked and documented per branch
3. Cross-branch improvements are documented in this overview
4. Regular updates to reflect current project status

## Getting Started
1. Check `DEVELOPMENT_V1.md` for the base implementation details
2. Review `DEVELOPMENT_V2.md` for intermediate development status
3. See `DEVELOPMENT_V3.md` for latest development progress
4. Follow branch-specific documentation for targeted work

## Common Resources
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- Project README.md for setup and configuration