/*
 * FAA Recruit platform layer.
 *
 * The app code (app.js) was first built as a claude.ai page and asks for its
 * services through `claude.use(name)`. This file provides those same services
 * on top of Supabase so the app runs on its own domain and in the iOS/Android
 * wrappers:
 *
 *   user      -> Supabase Auth (Google, email link, X). Owner = email listed in app_owners.
 *   db        -> table `docs` (one row per document, path "collection/id"), with
 *                row-level security matching the original access rules.
 *   assets    -> Storage bucket `media` (public read).
 *   artifact  -> "Publish changes" saves the site data to table `site_state`.
 *   downloads -> normal browser download.
 *
 * With no Supabase keys in config.js the app runs in demo mode: the site data
 * loads from state.json and sign-in is turned off.
 */
(function () {
  const CFG = window.FAA_CONFIG || {};
  const LIVE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const SUPABASE_ESM = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
  let sb = null, session = null, ownerFlag = false;

  const toast = (m) => { const t = document.getElementById('toast'); if (!t) return alert(m); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 3200); };
  const err = (code, message) => Object.assign(new Error(message || code), { code });

  async function client() {
    if (!LIVE) return null;
    if (sb) return sb;
    const { createClient } = await import(SUPABASE_ESM);
    sb = createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' } });
    const { data } = await sb.auth.getSession();
    session = data.session;
    sb.auth.onAuthStateChange((evt, s) => {
      const was = session?.user?.id; session = s;
      if ((s?.user?.id || null) !== (was || null)) location.reload();
    });
    if (session) { try { const { data: o } = await sb.rpc('is_owner'); ownerFlag = !!o; } catch (e) { ownerFlag = false; } }
    return sb;
  }

  /* ---------- auth buttons used by the Sign In page ---------- */
  const redirectTo = () => (CFG.siteUrl || location.origin + location.pathname) + '#me';
  window.FAA_AUTH = {
    async google() { const c = await client(); if (!c) return toast('Sign-in is off in demo mode. Add your Supabase keys in config.js.'); await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo() } }); },
    async x() { const c = await client(); if (!c) return toast('Sign-in is off in demo mode.'); await c.auth.signInWithOAuth({ provider: 'twitter', options: { redirectTo: redirectTo() } }); },
    async emailPrompt() {
      const c = await client(); if (!c) return toast('Sign-in is off in demo mode.');
      const email = (prompt('Your email address') || '').trim(); if (!/^\S+@\S+\.\S+$/.test(email)) return;
      const { error } = await c.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
      toast(error ? 'Could not send the link. Try again.' : 'Check your email for a sign-in link.');
    },
    async signOut() { const c = await client(); if (c) await c.auth.signOut(); location.hash = 'home'; location.reload(); }
  };

  /* ---------- db: document store on table `docs` ---------- */
  function snap(row) { return { id: row ? row.doc_id : null, exists: !!row, data: () => (row ? structuredClone(row.data || {}) : undefined) }; }
  function docRef(path) {
    const [collection, id] = path.split('/');
    return {
      id,
      async get() { const { data, error } = await sb.from('docs').select('doc_id,data').eq('path', path).maybeSingle(); if (error) throw err('read_failed', error.message); return snap(data); },
      async set(obj) { const { error } = await sb.from('docs').upsert({ path, collection, doc_id: id, data: obj, updated_at: new Date().toISOString() }); if (error) throw err('invalid_argument', error.message); },
      async update(patch) { const cur = await this.get(); await this.set({ ...(cur.exists ? cur.data() : {}), ...patch }); },
      async delete() { const { error } = await sb.from('docs').delete().eq('path', path); if (error) throw err('invalid_argument', error.message); }
    };
  }
  function collRef(collection, lim = 500) {
    const fetchAll = async () => { const { data, error } = await sb.from('docs').select('doc_id,data').eq('collection', collection).order('updated_at', { ascending: false }).limit(lim); if (error) throw err('read_failed', error.message); return { docs: (data || []).map(snap) }; };
    return {
      limit(n) { return collRef(collection, n); },
      get: fetchAll,
      onSnapshot(cb) {
        let live = true; const push = () => fetchAll().then((s) => live && cb(s)).catch(() => {});
        push();
        const ch = sb.channel('docs-' + collection + '-' + Math.random().toString(36).slice(2))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'docs', filter: 'collection=eq.' + collection }, push).subscribe();
        return () => { live = false; sb.removeChannel(ch); };
      }
    };
  }
  const dbApi = { doc: docRef, collection: (c) => collRef(c) };

  /* ---------- user ---------- */
  const userApi = {
    async me() { const u = session.user; return { id: u.id, name: u.user_metadata?.full_name || u.user_metadata?.name || u.email || '', isOwner: ownerFlag }; },
    isOwner: () => ownerFlag, canEdit: () => ownerFlag,
    async id() { return session.user.id; },
    async profiles(ids) {
      const out = {}; if (!ids?.length) return out;
      const { data } = await sb.from('docs').select('doc_id,data').in('path', ids.map((i) => 'profiles/' + i));
      (data || []).forEach((r) => (out[r.doc_id] = { name: r.data?.name || '' }));
      return out;
    }
  };

  /* ---------- assets: Supabase Storage ---------- */
  const assetsApi = {
    async upload(file) {
      const ext = (file.name || '').split('.').pop()?.toLowerCase() || (file.type.split('/')[1] || 'bin');
      const key = session.user.id + '/' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + '.' + ext.replace(/[^a-z0-9]/g, '');
      const { error } = await sb.storage.from('media').upload(key, file, { contentType: file.type || undefined, upsert: false });
      if (error) throw err(/type/i.test(error.message) ? 'unsupported_type' : 'upload_failed', error.message);
      const { data } = sb.storage.from('media').getPublicUrl(key);
      return { id: key, url: data.publicUrl, sizeBytes: file.size, contentType: file.type };
    }
  };

  /* ---------- artifact.publish: save site data ---------- */
  const artifactApi = {
    async publish(html) {
      const m = /<script type="application\/json" id="state">([\s\S]*?)<\/script>/.exec(html);
      if (!m) throw err('bad_request', 'No site data in document');
      const data = JSON.parse(m[1]);
      const { error } = await sb.from('site_state').upsert({ id: 1, data, updated_at: new Date().toISOString() });
      if (error) throw err(/permission|policy/i.test(error.message) ? 'not_writer' : 'publish_failed', error.message);
      setTimeout(() => location.reload(), 600);
    }
  };

  /* ---------- downloads ---------- */
  const downloadsApi = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data]);
      const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000);
    }
  };

  window.claude = {
    async use(name) {
      if (name === 'downloads') return downloadsApi;
      const c = await client().catch(() => null);
      if (!c) return null;
      if (name === 'db') return dbApi;
      if (name === 'user') return session ? userApi : null;
      if (!session) return null;
      if (name === 'assets') return assetsApi;
      if (name === 'artifact' || name === 'self') return ownerFlag ? artifactApi : null;
      return null;
    }
  };

  /* ---------- boot: load live site data, then start the app ---------- */
  async function start() {
    let state = null;
    try {
      const c = await client();
      if (c) { const { data } = await c.from('site_state').select('data').eq('id', 1).maybeSingle(); state = data?.data || null; }
    } catch (e) { /* fall back to bundled data */ }
    if (!state) state = await fetch('state.json', { cache: 'no-cache' }).then((r) => r.json());
    document.getElementById('state').textContent = JSON.stringify(state).replace(/</g, '\\u003c');
    const s = document.createElement('script'); s.src = 'app.js'; document.body.append(s);
  }
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  start();
})();
