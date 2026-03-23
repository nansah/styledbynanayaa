/* ═══════════════════════════════════════════════════════════════════
   STYLED BY NANA YAA — Instagram Grid (Supabase-powered)
   Tiles are managed from the Admin → Instagram Grid panel.
   ═══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async function () {
  var grid = document.getElementById('ig-grid');
  if (!grid) return;

  try {
    var tiles = await BlogCMS.getIgTiles();

    if (!tiles.length) {
      grid.style.display = 'none';
      return;
    }

    grid.innerHTML = '';
    tiles.forEach(function (t) {
      if (!t.image_url) return;
      var a = document.createElement('a');
      a.className = 'ig-tile';
      a.href      = t.post_url || 'https://instagram.com/nanayaaansah';
      a.target    = '_blank';
      a.rel       = 'noopener noreferrer';
      a.style.backgroundImage = 'url(\'' + t.image_url + '\')';
      a.innerHTML = '<div class="ig-tile-overlay"></div>';
      grid.appendChild(a);
    });
  } catch (err) {
    console.error('[Instagram Grid] Failed to load tiles:', err.message);
    grid.style.display = 'none';
  }
});
