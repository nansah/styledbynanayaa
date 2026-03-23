/* ═══════════════════════════════════════════════════════════════════
   STYLED BY NANA YAA — Blog CMS (Supabase)
   Requires: config.js loaded before this file
             @supabase/supabase-js v2 CDN loaded before this file
   ═══════════════════════════════════════════════════════════════════ */

const BlogCMS = (() => {
  'use strict';

  // Initialise client (config.js provides SUPABASE_URL + SUPABASE_ANON_KEY)
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /* ── Row mappers ──────────────────────────────────────────────── */
  function fromRow(row) {
    return {
      id:          row.id,
      slug:        row.slug,
      title:       row.title,
      category:    row.category,
      status:      row.status,
      publishedAt: row.published_at,
      coverImage:  row.cover_image  || '',
      coverAlt:    row.cover_alt    || '',
      excerpt:     row.excerpt      || '',
      body:        row.body         || '',
      seoTitle:    row.seo_title    || '',
      seoDesc:     row.seo_desc     || '',
      tags:        row.tags         || [],
    };
  }

  function toRow(post) {
    return {
      id:           post.id,
      slug:         post.slug,
      title:        post.title,
      category:     post.category,
      status:       post.status,
      published_at: post.publishedAt  || null,
      cover_image:  post.coverImage   || null,
      cover_alt:    post.coverAlt     || null,
      excerpt:      post.excerpt      || null,
      body:         post.body         || null,
      seo_title:    post.seoTitle     || null,
      seo_desc:     post.seoDesc      || null,
      tags:         post.tags         || [],
    };
  }

  /* ── CRUD ─────────────────────────────────────────────────────── */

  async function getPosts() {
    const { data, error } = await db
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false });
    if (error) throw error;
    return (data || []).map(fromRow);
  }

  async function getPublished(category) {
    // Include published + scheduled posts whose publish date has passed
    let q = db
      .from('posts')
      .select('*')
      .in('status', ['published', 'scheduled'])
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });
    if (category) q = q.eq('category', category);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(fromRow);
  }

  async function getPost(slug) {
    const { data, error } = await db
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error || !data) return null;
    return fromRow(data);
  }

  async function save(post) {
    const row = toRow(post);
    const { data, error } = await db
      .from('posts')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return fromRow(data);
  }

  async function remove(id) {
    const { error } = await db.from('posts').delete().eq('id', id);
    if (error) throw error;
  }

  /* ── Faves row mappers ────────────────────────────────────────── */

  function fromFaveRow(row) {
    return {
      id:           row.id,
      name:         row.name,
      brand:        row.brand,
      category:     row.category,
      status:       row.status,
      description:  row.description  || '',
      price:        row.price        || '',
      affiliateUrl: row.affiliate_url || '',
      imageUrl:     row.image_url    || '',
      isFave:       row.is_fave      || false,
      sortOrder:    row.sort_order   || 0,
    };
  }

  function toFaveRow(fave) {
    return {
      id:            fave.id,
      name:          fave.name,
      brand:         fave.brand,
      category:      fave.category,
      status:        fave.status,
      description:   fave.description  || null,
      price:         fave.price        || null,
      affiliate_url: fave.affiliateUrl || null,
      image_url:     fave.imageUrl     || null,
      is_fave:       fave.isFave       || false,
      sort_order:    fave.sortOrder    || 0,
    };
  }

  /* ── Faves CRUD ───────────────────────────────────────────────── */

  async function getFaves(category) {
    let q = db.from('faves').select('*').order('sort_order', { ascending: true });
    if (category) q = q.eq('category', category);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(fromFaveRow);
  }

  async function getPublishedFaves(category) {
    let q = db.from('faves').select('*').eq('status', 'published').order('sort_order', { ascending: true });
    if (category) q = q.eq('category', category);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(fromFaveRow);
  }

  async function saveFave(fave) {
    const row = toFaveRow(fave);
    const { data, error } = await db
      .from('faves')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return fromFaveRow(data);
  }

  async function removeFave(id) {
    const { error } = await db.from('faves').delete().eq('id', id);
    if (error) throw error;
  }

  /* ── Auth (Supabase email/password) ──────────────────────────── */

  async function login(email, password) {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function logout() {
    await db.auth.signOut();
  }

  async function getSession() {
    const { data } = await db.auth.getSession();
    return data.session;
  }

  function onAuthChange(cb) {
    return db.auth.onAuthStateChange((_event, session) => cb(session));
  }

  /* ── Helpers ──────────────────────────────────────────────────── */

  function slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'America/New_York',
    });
  }

  /* ── Export / Import ──────────────────────────────────────────── */

  async function exportPosts() {
    const posts = await getPosts();
    const blob  = new Blob([JSON.stringify(posts, null, 2)], { type: 'application/json' });
    const a     = document.createElement('a');
    a.href      = URL.createObjectURL(blob);
    a.download  = `nya-posts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  async function importPosts(json) {
    let posts;
    try {
      posts = JSON.parse(json);
    } catch (e) {
      return { ok: false, error: 'Invalid JSON: ' + e.message };
    }
    if (!Array.isArray(posts)) {
      return { ok: false, error: 'File must contain a JSON array.' };
    }
    let imported = 0;
    for (const p of posts) {
      // Accept both camelCase (our format) and any missing fields gracefully
      const post = {
        id:          p.id          || uid(),
        slug:        p.slug        || slugify(p.title || ''),
        title:       p.title       || '',
        category:    p.category    || 'lifestyle',
        status:      p.status      || 'published',
        publishedAt: p.publishedAt || p.published_at || new Date().toISOString(),
        coverImage:  p.coverImage  || p.cover_image  || '',
        coverAlt:    p.coverAlt    || p.cover_alt    || '',
        excerpt:     p.excerpt     || '',
        body:        p.body        || '',
        seoTitle:    p.seoTitle    || p.seo_title    || '',
        seoDesc:     p.seoDesc     || p.seo_desc     || '',
        tags:        p.tags        || [],
      };
      try {
        await save(post);
        imported++;
      } catch (e) {
        return { ok: false, error: 'Post "' + post.title.slice(0, 40) + '" failed: ' + e.message };
      }
    }
    return { ok: true, count: imported };
  }

  /* ── Instagram Grid ───────────────────────────────────────────── */

  async function getIgTiles() {
    const { data, error } = await db
      .from('ig_tiles')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function saveIgTile(tile) {
    const { data, error } = await db
      .from('ig_tiles')
      .upsert({ id: tile.id, image_url: tile.imageUrl, post_url: tile.postUrl, sort_order: tile.sortOrder }, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function removeIgTile(id) {
    const { error } = await db.from('ig_tiles').delete().eq('id', id);
    if (error) throw error;
  }

  /* ── Public API ───────────────────────────────────────────────── */
  return {
    db,
    getPosts, getPublished, getPost, save, remove,
    getFaves, getPublishedFaves, saveFave, removeFave,
    getIgTiles, saveIgTile, removeIgTile,
    login, logout, getSession, onAuthChange,
    slugify, uid, formatDate,
    exportPosts, importPosts,
  };
})();
