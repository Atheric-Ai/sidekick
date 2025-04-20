/**
 * YouTube Transcript Extractor
 * 
 * JavaScript implementation of transcript extraction logic
 * Adapted from Python implementation with browser-specific optimizations
 */

// Regular expressions for extracting video IDs from various URL formats
const VIDEO_ID_PATTERNS = [
  /(?:v=|\/)([0-9A-Za-z_-]{11}).*/,
  /(?:embed\/|v\/|youtu.be\/)([0-9A-Za-z_-]{11})/,
  /(?:watch\?v=)([0-9A-Za-z_-]{11})/
];

/**
 * Extract YouTube video ID from various URL formats
 * @param {string} url - YouTube URL in any standard format
 * @returns {string|null} Video ID if found, null otherwise
 */
function extractVideoId(url) {
  if (!url || typeof url !== 'string') {
    console.warn(`Invalid URL provided: ${url}`);
    return null;
  }

  for (const pattern of VIDEO_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  console.warn(`Could not extract video ID from URL: ${url}`);
  return null;
}

/**
 * Fetch transcript data for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Array>} Array of transcript segments
 */
async function getTranscript(videoId) {
  if (!videoId) {
    throw new Error('No video ID provided');
  }

  try {
    // First, get the list of available transcripts
    const listResponse = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&type=list`);
    const xmlText = await listResponse.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Get the first available transcript (usually auto-generated)
    const track = xmlDoc.querySelector('track');
    if (!track) {
      throw new Error('No transcript available');
    }

    // Get the transcript data
    const lang = track.getAttribute('lang_code');
    const transcriptResponse = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}`);
    const transcriptXml = await transcriptResponse.text();
    const transcriptDoc = parser.parseFromString(transcriptXml, 'text/xml');

    // Convert XML transcript to the same format as the Python version
    const textElements = transcriptDoc.getElementsByTagName('text');
    const transcript = [];

    for (const element of textElements) {
      transcript.push({
        text: element.textContent,
        start: parseFloat(element.getAttribute('start')),
        duration: parseFloat(element.getAttribute('dur') || '0')
      });
    }

    return transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
}

/**
 * Format transcript into readable text
 * @param {Array} transcript - Array of transcript segments
 * @param {number} lineWidth - Maximum width of lines in characters
 * @returns {string} Formatted transcript text
 */
function formatTranscript(transcript, lineWidth = 80) {
  if (!transcript || transcript.length === 0) {
    console.warn('Empty transcript received, cannot format');
    return '';
  }

  // Combine all transcript segments
  let fullText = transcript
    .map(item => item.text.trim())
    .join(' ')
    .replace(/\s+/g, ' '); // Normalize spaces

  // Wrap text to specified line width
  const words = fullText.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= lineWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join('\n');
}

/**
 * Process a YouTube video URL to extract and format its transcript
 * @param {string} url - YouTube video URL
 * @param {number} lineWidth - Width of lines in formatted text
 * @returns {Promise<Object>} Object containing success status, formatted text, video ID, and any error message
 */
async function processVideoUrl(url, lineWidth = 80) {
  try {
    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return {
        success: false,
        formattedText: '',
        videoId: null,
        errorMessage: `Invalid YouTube URL: ${url}`
      };
    }

    // Get transcript
    const transcript = await getTranscript(videoId);

    // Format transcript
    const formattedText = formatTranscript(transcript, lineWidth);
    if (!formattedText) {
      return {
        success: false,
        formattedText: '',
        videoId,
        errorMessage: 'Formatting failed: empty result'
      };
    }

    return {
      success: true,
      formattedText,
      videoId,
      errorMessage: ''
    };
  } catch (error) {
    return {
      success: false,
      formattedText: '',
      videoId: extractVideoId(url),
      errorMessage: `Error processing transcript: ${error.message}`
    };
  }
}

export {
  extractVideoId,
  getTranscript,
  formatTranscript,
  processVideoUrl
}; 