/* ═══════════════════════════════════════════════════════════════════
   STYLED BY NANA YAA — INSTAGRAM GRAPH API INTEGRATION
   ═══════════════════════════════════════════════════════════════════

   HOW TO GET YOUR ACCESS TOKEN
   ─────────────────────────────────────────────────────────────────
   1. Go to https://developers.facebook.com/ and create a developer account
   2. Create a new App → choose "Consumer" or "Business" type
   3. Add the "Instagram Graph API" product to your app
   4. In App Dashboard → Instagram → API Setup with Instagram Login
   5. Connect your Instagram Professional account (Creator or Business)
   6. Generate a User Access Token with these permissions:
        - instagram_basic
        - instagram_content_publish  (optional, for posting)
        - pages_show_list            (if using Business account)
   7. Use the Access Token Debugger to verify:
      https://developers.facebook.com/tools/accesstoken/
   8. Exchange for a Long-Lived Token (valid 60 days) via:
      GET https://graph.instagram.com/access_token
          ?grant_type=ig_exchange_token
          &client_id={APP_ID}
          &client_secret={APP_SECRET}
          &access_token={SHORT_LIVED_TOKEN}
   9. Copy the returned access_token and paste it below

   TOKEN REFRESH REMINDER
   ─────────────────────────────────────────────────────────────────
   Long-lived tokens expire after 60 days. Refresh before expiry:

   GET https://graph.instagram.com/refresh_access_token
       ?grant_type=ig_refresh_token
       &access_token={LONG_LIVED_TOKEN}

   Call this endpoint from a server-side script or cron job every
   ~50 days to keep the token alive. Store the new token securely
   (environment variable or server config — never commit to git).

   ═══════════════════════════════════════════════════════════════════ */

/* ── CONFIG ──────────────────────────────────────────────────────── */
const INSTAGRAM_CONFIG = {
  // Paste your Long-Lived Access Token here.
  // For production, load this from a server endpoint or env variable.
  accessToken: 'YOUR_ACCESS_TOKEN_HERE',

  // Number of posts to fetch and display
  count: 6,

  // Instagram Graph API base URL
  apiBase: 'https://graph.instagram.com',

  // Fields to request from each media object
  fields: 'id,media_type,media_url,thumbnail_url,permalink,caption',
};

/* ── HELPER: Is the token configured? ────────────────────────────── */
function isTokenConfigured() {
  return (
    INSTAGRAM_CONFIG.accessToken &&
    INSTAGRAM_CONFIG.accessToken !== 'YOUR_ACCESS_TOKEN_HERE' &&
    INSTAGRAM_CONFIG.accessToken.trim().length > 10
  );
}

/* ── FETCH: Get posts from the Instagram Graph API ───────────────── */
/**
 * fetchInstagramPosts()
 * Calls the Instagram Graph API to retrieve recent media.
 * Returns an array of post objects, or throws on failure.
 *
 * @returns {Promise<Array>} Array of media objects
 */
async function fetchInstagramPosts() {
  const { apiBase, accessToken, count, fields } = INSTAGRAM_CONFIG;

  const url =
    `${apiBase}/me/media` +
    `?fields=${encodeURIComponent(fields)}` +
    `&limit=${count}` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Instagram API error ${response.status}: ` +
      (errorData?.error?.message || response.statusText)
    );
  }

  const data = await response.json();

  if (!data.data || !Array.isArray(data.data)) {
    throw new Error('Unexpected Instagram API response shape.');
  }

  return data.data;
}

/* ── RENDER: Populate the .instagram-grid with live tiles ────────── */
/**
 * renderInstagramGrid(posts)
 * Replaces placeholder tiles in .instagram-grid with live <a> tiles.
 * Each tile links to the post permalink and shows caption on hover.
 *
 * @param {Array} posts - Array of media objects from fetchInstagramPosts()
 */
function renderInstagramGrid(posts) {
  const grid = document.querySelector('.instagram-grid');
  if (!grid) return;

  // Clear existing placeholder tiles
  grid.innerHTML = '';

  posts.forEach(post => {
    // For VIDEO posts, use thumbnail_url; for images use media_url
    const imageUrl =
      post.media_type === 'VIDEO'
        ? (post.thumbnail_url || '')
        : (post.media_url || '');

    // Truncate caption for overlay display
    const captionSnippet = post.caption
      ? post.caption.replace(/\n/g, ' ').substring(0, 120) + (post.caption.length > 120 ? '…' : '')
      : '';

    const tile = document.createElement('a');
    tile.href = post.permalink || '#';
    tile.target = '_blank';
    tile.rel = 'noopener noreferrer';
    tile.className = 'ig-tile ig-tile--live';
    tile.setAttribute('aria-label', captionSnippet || 'View on Instagram');

    if (imageUrl) {
      tile.style.backgroundImage = `url('${imageUrl}')`;
      tile.style.backgroundSize = 'cover';
      tile.style.backgroundPosition = 'center';
    } else {
      // Fallback background if no image URL
      tile.style.background = 'linear-gradient(135deg, #f5e8d8 0%, #e8d0b8 100%)';
    }

    // Caption hover overlay
    if (captionSnippet) {
      const overlay = document.createElement('div');
      overlay.className = 'ig-caption-overlay';
      const captionEl = document.createElement('p');
      captionEl.className = 'ig-caption-text';
      captionEl.textContent = captionSnippet;
      overlay.appendChild(captionEl);
      tile.appendChild(overlay);
    }

    grid.appendChild(tile);
  });

  // Mark grid as live
  grid.setAttribute('data-ig-status', 'live');
}

/* ── FALLBACK: Show "Connect Instagram" badge on placeholder tiles ── */
/**
 * showPlaceholderBadges()
 * Adds a subtle "Connect Instagram" badge to each placeholder tile.
 * Called when the token is not set or the fetch fails gracefully.
 */
function showPlaceholderBadges() {
  const grid = document.querySelector('.instagram-grid');
  if (!grid) return;

  const tiles = grid.querySelectorAll('.ig-tile--placeholder');
  tiles.forEach((tile, index) => {
    // Only show badge on first tile to avoid visual clutter
    if (index === 0) {
      const badge = document.createElement('div');
      badge.className = 'ig-connect-badge';
      badge.textContent = 'Connect Instagram';
      tile.appendChild(badge);
    }
  });
}

/* ── INIT: Auto-initializes on DOMContentLoaded ──────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  const setupBanner = document.getElementById('ig-setup-banner');
  const grid = document.querySelector('.instagram-grid');

  // If token is not configured, show placeholders + setup UI and exit
  if (!isTokenConfigured()) {
    console.info(
      '[Instagram] Access token not configured. ' +
      'Edit INSTAGRAM_CONFIG.accessToken in instagram.js to connect your feed.'
    );
    // Setup banner remains visible (shown by default in HTML)
    showPlaceholderBadges();
    return;
  }

  // Token is configured — attempt to load live posts
  try {
    const posts = await fetchInstagramPosts();

    if (posts.length > 0) {
      renderInstagramGrid(posts);

      // Hide the setup banner now that we have live posts
      if (setupBanner) {
        setupBanner.hidden = true;
      }

      // Update grid status
      if (grid) {
        grid.setAttribute('data-ig-status', 'live');
      }

      console.info(`[Instagram] Loaded ${posts.length} posts successfully.`);
    } else {
      // API returned no posts — keep placeholders
      console.warn('[Instagram] API returned 0 posts. Keeping placeholder tiles.');
      showPlaceholderBadges();
    }
  } catch (error) {
    // Graceful fallback — log the error, keep placeholders visible
    console.error('[Instagram] Failed to load posts:', error.message);
    console.info(
      '[Instagram] Placeholder tiles will remain visible. ' +
      'Check your access token and app permissions at https://developers.facebook.com/'
    );

    // Keep setup banner visible with updated messaging
    if (setupBanner) {
      const textEl = setupBanner.querySelector('.ig-setup-text span');
      if (textEl) {
        textEl.textContent =
          'Could not load Instagram posts. Check your token and app permissions.';
      }
    }

    showPlaceholderBadges();
  }
});
