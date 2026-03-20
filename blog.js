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
    let q = db
      .from('posts')
      .select('*')
      .eq('status', 'published')
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
    try {
      const posts = JSON.parse(json);
      if (!Array.isArray(posts)) throw new Error('not an array');
      for (const p of posts) await save(p);
      return true;
    } catch {
      return false;
    }
  }

  /* ── Public API ───────────────────────────────────────────────── */
  return {
    db,
    getPosts, getPublished, getPost, save, remove,
    login, logout, getSession, onAuthChange,
    slugify, uid, formatDate,
    exportPosts, importPosts,
  };
})();
