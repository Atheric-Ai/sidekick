// Create and inject the sidebar
function createSidebar() {
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'summary-toggle-button';
  toggleButton.innerHTML = '&#10094;'; // Left-pointing angle bracket
  toggleButton.title = 'Show Summary';
  document.body.appendChild(toggleButton);

  // Create sidebar with initial invisible state
  const sidebar = document.createElement('div');
  sidebar.id = 'yt-summary-sidebar';
  sidebar.style.opacity = '0';
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <h2>Video Summary</h2>
      <button id="close-sidebar" title="Hide summary">×</button>
    </div>
    <div class="sidebar-content">
      <div id="summary-content"></div>
      <div class="download-options">
        <button id="download-transcript">Download Transcript</button>
        <button id="download-summary">Download Summary</button>
        <button id="download-both">Download Both</button>
      </div>
    </div>
  `;
  document.body.appendChild(sidebar);

  // Update positions based on YouTube layout
  const updatePositions = () => {
    // Find the video player container
    const videoPlayer = document.querySelector('#player-container-outer');
    if (!videoPlayer) return;

    const playerRect = videoPlayer.getBoundingClientRect();
    const topPosition = Math.max(playerRect.top, 0);

    // First ensure toggle button is visible and positioned
    toggleButton.style.display = 'block';
    toggleButton.style.top = `${topPosition}px`;
    toggleButton.style.opacity = '1';

    // Force layout recalculation
    void toggleButton.offsetHeight;

    // Now get the toggle button's exact position
    const toggleRect = toggleButton.getBoundingClientRect();

    // Set sidebar position to match toggle exactly
    sidebar.style.position = 'fixed';
    sidebar.style.top = `${toggleRect.top}px`;

    // Find the secondary column for width and height
    const secondary = document.querySelector('#secondary.ytd-watch-flexy');
    if (secondary) {
      const secondaryRect = secondary.getBoundingClientRect();
      sidebar.style.width = `${secondaryRect.width}px`;
      
      // Calculate height from toggle top to secondary bottom
      const height = secondaryRect.bottom - toggleRect.top;
      sidebar.style.height = `${height}px`;
      
      // Log positions for debugging
      console.log('Toggle top:', toggleRect.top);
      console.log('Secondary bottom:', secondaryRect.bottom);
      console.log('Calculated height:', height);
    }

    // If sidebar is not meant to be visible, restore toggle button's hidden state
    if (!sidebar.classList.contains('visible')) {
      toggleButton.style.display = 'none';
      toggleButton.style.opacity = '0';
    }
  };

  // Initial position update with retry
  const initializePosition = () => {
    const maxAttempts = 10;
    let attempts = 0;

    const tryUpdate = () => {
      const videoPlayer = document.querySelector('#player-container-outer');
      if (videoPlayer && videoPlayer.getBoundingClientRect().height > 0) {
        updatePositions();
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryUpdate, 100);
      }
    };

    tryUpdate();
  };

  // Call initial position update
  initializePosition();

  // Watch for layout changes
  const observer = new ResizeObserver(() => {
    if (isVideoPage()) {
      updatePositions();
    }
  });

  // Observe the video player and its container
  const observeElements = () => {
    const elements = [
      document.querySelector('#player-container-outer'),
      document.querySelector('#player'),
      document.querySelector('ytd-watch-flexy')
    ];
    
    elements.forEach(element => {
      if (element) observer.observe(element);
    });
  };

  // Initial observation
  observeElements();

  // Watch for DOM changes that might affect layout
  const layoutObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.target.id === 'player-container-outer' || 
          mutation.target.id === 'player') {
        updatePositions();
        break;
      }
    }
  });

  layoutObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });

  // Add event listeners
  document.getElementById('close-sidebar').addEventListener('click', () => {
    hideSidebar(sidebar, toggleButton);
  });

  toggleButton.addEventListener('click', () => {
    if (sidebar.style.display === 'none' || !sidebar.classList.contains('visible')) {
      showSidebar(sidebar, toggleButton);
    } else {
      hideSidebar(sidebar, toggleButton);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('visible')) {
      hideSidebar(sidebar, toggleButton);
    }
  });

  // Add window resize listener
  window.addEventListener('resize', updatePositions);

  return { 
    sidebar, 
    toggleButton, 
    observer,
    layoutObserver,
    cleanup: () => {
      observer.disconnect();
      layoutObserver.disconnect();
      window.removeEventListener('resize', updatePositions);
    }
  };
}

// Function to wait for YouTube layout to be ready
function waitForYouTubeLayout() {
  return new Promise((resolve) => {
    const checkLayout = () => {
      const secondary = document.querySelector('#secondary.ytd-watch-flexy');
      if (secondary && secondary.getBoundingClientRect().width > 0) {
        resolve();
      } else {
        requestAnimationFrame(checkLayout);
      }
    };
    checkLayout();
  });
}

// Function to show sidebar
async function showSidebar(sidebar, toggleButton) {
  // First make sure YouTube's layout is ready
  await waitForYouTubeLayout();
  
  // Set initial position and dimensions
  adjustSidebarDimensions(sidebar);
  
  // Hide toggle button
  toggleButton.style.opacity = '0';
  setTimeout(() => {
    toggleButton.style.display = 'none';
    toggleButton.classList.remove('visible');
  }, 300);
  
  // Make visible but transparent
  sidebar.style.display = 'block';
  sidebar.style.opacity = '0';
  
  // Force reflow and add visible class
  sidebar.offsetHeight;
  sidebar.classList.add('visible');
  
  // Start watching for layout changes
  startLayoutObserver(sidebar);
  
  // Fade in
  requestAnimationFrame(() => {
    sidebar.style.opacity = '1';
  });
}

// Function to hide sidebar
function hideSidebar(sidebar, toggleButton) {
  sidebar.style.opacity = '0';
  sidebar.classList.add('collapsed');
  setTimeout(() => {
    sidebar.style.display = 'none';
    sidebar.classList.remove('collapsed', 'visible');
    
    // Show toggle button
    toggleButton.style.display = 'block';
    toggleButton.classList.add('visible');
    requestAnimationFrame(() => {
      toggleButton.style.opacity = '1';
    });
    
    // Stop watching for layout changes
    if (sidebar._layoutObserver) {
      sidebar._layoutObserver.disconnect();
    }
  }, 300);
}

// Function to start layout observer
function startLayoutObserver(sidebar) {
  // Clean up existing observer if any
  if (sidebar._layoutObserver) {
    sidebar._layoutObserver.disconnect();
  }
  
  // Create new observer
  sidebar._layoutObserver = new MutationObserver(() => {
    if (isVideoPage() && sidebar.classList.contains('visible')) {
      adjustSidebarDimensions(sidebar);
    }
  });
  
  // Start observing
  sidebar._layoutObserver.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true
  });
}

// Function to adjust sidebar dimensions
function adjustSidebarDimensions(sidebar) {
  const secondary = document.querySelector('#secondary.ytd-watch-flexy');
  if (secondary) {
    const rect = secondary.getBoundingClientRect();
    sidebar.style.width = `${rect.width}px`;
    sidebar.style.top = `${rect.top}px`;
    sidebar.style.height = `${rect.height}px`;
  }
}

// Function to check if current page is a video page
function isVideoPage() {
  return window.location.pathname.includes('/watch');
}

// Function to get video URL from context menu target
function getVideoUrlFromTarget(targetId) {
  // First try to find the element by ID
  const element = document.querySelector(`[data-contextmenu-target="${targetId}"]`) || 
                 document.querySelector(`[data-target-id="${targetId}"]`) ||
                 document.elementFromPoint(contextMenuX, contextMenuY);
  
  if (!element) {
    console.error('Could not find target element');
    return null;
  }

  // Find the closest link or video element
  let target = element.closest('a') || element.closest('ytd-thumbnail');
  if (!target) {
    console.error('Could not find video link or thumbnail');
    return null;
  }

  // If it's a thumbnail, find its parent link
  if (target.tagName === 'YTD-THUMBNAIL') {
    target = target.closest('a');
  }

  // Get the URL
  if (target && target.href && target.href.includes('/watch?')) {
    console.log('Found video URL:', target.href);
    return target.href;
  }

  console.error('Could not extract video URL');
  return null;
}

// Function to navigate to video page
function navigateToVideo(videoUrl) {
  console.log('Navigating to:', videoUrl);
  // Store flag to auto-start summary
  sessionStorage.setItem('autoSummarize', 'true');
  // Navigate to video page
  window.location.href = videoUrl;
}

// Function to download content
function downloadContent(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Store mouse position for context menu
let contextMenuX = 0;
let contextMenuY = 0;
document.addEventListener('contextmenu', (e) => {
  contextMenuX = e.clientX;
  contextMenuY = e.clientY;
});

// Function to clean up sidebar and toggle
function cleanupSidebarAndToggle() {
  const sidebar = document.getElementById('yt-summary-sidebar');
  const toggleButton = document.getElementById('summary-toggle-button');
  
  if (sidebar) {
    sidebar.remove();
  }
  if (toggleButton) {
    toggleButton.remove();
  }
}

// Initialize modules
async function initializeModules() {
  const [{ generateSummaryWithProvider }, { processVideoUrl }] = await Promise.all([
    import(chrome.runtime.getURL('utils/llm-providers.js')),
    import(chrome.runtime.getURL('utils/transcript-extractor.js'))
  ]);

  // Track both URL and video ID changes
  let lastUrl = location.href;
  let lastVideoId = new URLSearchParams(window.location.search).get('v');

  // Watch for any navigation or content changes
  const navigationObserver = new MutationObserver(() => {
    const currentUrl = location.href;
    const currentVideoId = new URLSearchParams(window.location.search).get('v');

    // Check if we've changed pages or videos
    if (currentUrl !== lastUrl || currentVideoId !== lastVideoId) {
      console.log('Navigation detected:', { 
        urlChanged: currentUrl !== lastUrl,
        videoChanged: currentVideoId !== lastVideoId
      });

      lastUrl = currentUrl;
      lastVideoId = currentVideoId;

      // Clean up if we're not on a video page or if we've changed videos
      if (!isVideoPage() || currentVideoId !== lastVideoId) {
        cleanupSidebarAndToggle();
      }
    }
  });

  // Start observing navigation
  navigationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  });

  // Also watch for YouTube's native navigation events
  document.addEventListener('yt-navigate-start', () => {
    console.log('YouTube navigation started');
    cleanupSidebarAndToggle();
  });

  document.addEventListener('yt-navigate-finish', () => {
    console.log('YouTube navigation finished');
    if (!isVideoPage()) {
      cleanupSidebarAndToggle();
    }
  });

  // Check if we should auto-summarize (coming from homepage)
  if (isVideoPage() && sessionStorage.getItem('autoSummarize')) {
    console.log('Auto-starting summary on video page');
    sessionStorage.removeItem('autoSummarize');
    handleSummarizeVideo(generateSummaryWithProvider, processVideoUrl);
  }

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    if (request.action === "summarizeVideo") {
      // Always try to get the video URL from the target first
      const videoUrl = getVideoUrlFromTarget(request.target);
      console.log('Found video URL:', videoUrl);

      // If we found a video URL and it's different from current page, navigate to it
      if (videoUrl) {
        const currentVideoId = new URLSearchParams(window.location.search).get('v');
        const targetVideoId = new URLSearchParams(new URL(videoUrl).search).get('v');
        
        if (currentVideoId !== targetVideoId) {
          console.log('Navigating to new video:', targetVideoId);
          navigateToVideo(videoUrl);
          return;
        }
      }

      // If we're already on the target video page or couldn't find a URL, try to summarize current video
      if (isVideoPage()) {
        console.log('Processing summary for current video page');
        handleSummarizeVideo(generateSummaryWithProvider, processVideoUrl);
      } else {
        console.error('Could not find video URL from context menu target');
      }
    }
  });
}

// Handle video summarization
async function handleSummarizeVideo(generateSummaryWithProvider, processVideoUrl) {
  let elements = document.getElementById('yt-summary-sidebar') ? 
    { 
      sidebar: document.getElementById('yt-summary-sidebar'),
      toggleButton: document.getElementById('summary-toggle-button')
    } : createSidebar();
  
  await showSidebar(elements.sidebar, elements.toggleButton);
  
  const summaryContent = document.getElementById('summary-content');
  summaryContent.innerHTML = 'Extracting transcript...';
  
  try {
    const videoUrl = window.location.href;
    const result = await processVideoUrl(videoUrl);
    if (!result.success) {
      throw new Error(result.errorMessage);
    }

    summaryContent.innerHTML = 'Generating summary...';
    
    const settings = await chrome.storage.sync.get(['provider', 'anthropicApiKey', 'geminiApiKey']);
    
    if (!settings.provider) {
      throw new Error('No LLM provider selected. Please configure in extension settings.');
    }

    const apiKey = settings.provider === 'anthropic' ? settings.anthropicApiKey : settings.geminiApiKey;
    if (!apiKey) {
      throw new Error(`No API key found for ${settings.provider}. Please configure in extension settings.`);
    }

    const summary = await generateSummaryWithProvider(settings.provider, result.formattedText, apiKey);
    summaryContent.innerHTML = summary;
    
    document.getElementById('download-transcript').onclick = () => {
      downloadContent(result.formattedText, 'transcript.txt');
    };
    
    document.getElementById('download-summary').onclick = () => {
      downloadContent(summary, 'summary.txt');
    };
    
    document.getElementById('download-both').onclick = () => {
      downloadContent(`Summary:\n\n${summary}\n\nTranscript:\n\n${result.formattedText}`, 'summary-and-transcript.txt');
    };
    
  } catch (error) {
    summaryContent.innerHTML = `Error: ${error.message}`;
  }
}

// Initialize the extension
initializeModules().catch(error => {
  console.error('Failed to initialize extension:', error);
}); 