/* ═══════════════════════════════════════════════════════════════════
   STYLED BY NANA YAA — Instagram Grid (Supabase-powered)
   Tiles are managed from Admin → Instagram Grid.
   ═══════════════════════════════════════════════════════════════════ */

(async function () {
  var grid = document.getElementById('ig-grid');
  if (!grid) return;

  try {
    var tiles = await BlogCMS.getIgTiles();
    var withImages = tiles.filter(function (t) { return t.image_url; });

    if (!withImages.length) {
      grid.style.display = 'none';
      return;
    }

    grid.innerHTML = '';
    withImages.forEach(function (t) {
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
    console.error('[Instagram Grid]', err);
    grid.style.display = 'none';
  }
})();
