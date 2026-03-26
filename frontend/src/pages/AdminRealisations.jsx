import { useMemo, useRef, useState } from 'react';

const MAX_FILES = 5;
const MAX_FILE_BYTES = 1.9 * 1024 * 1024;

function fileToAttachment(file) {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`« ${file.name} » dépasse 1,9 Mo par fichier.`);
  }
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const dataUrl = r.result;
      const i = typeof dataUrl === 'string' ? dataUrl.indexOf(',') : -1;
      const b64 = i >= 0 ? dataUrl.slice(i + 1) : '';
      resolve({ name: file.name, type: file.type || 'image/jpeg', content: b64 });
    };
    r.onerror = () => reject(new Error('Impossible de lire un fichier.'));
    r.readAsDataURL(file);
  });
}

function buildBasicAuth(user, pass) {
  return `Basic ${btoa(`${user}:${pass}`)}`;
}

export default function AdminRealisations() {
  const fileInputRef = useRef(null);
  const formTopRef = useRef(null);

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authHeader, setAuthHeader] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [realisations, setRealisations] = useState([]);

  const [form, setForm] = useState({
    titre: '',
    description: '',
    date: '',
  });

  const loggedIn = useMemo(() => !!authHeader, [authHeader]);
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const load = async (header) => {
    const res = await fetch('/api/admin/realisations', { headers: { Authorization: header } });
    if (!res.ok) throw new Error('Identifiants incorrects (ou admin pas configuré côté backend).');
    const data = await res.json();
    setRealisations(data.realisations || []);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const header = buildBasicAuth(loginUser, loginPass);
      await load(header);
      setAuthHeader(header);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const files = fileInputRef.current?.files;
      const photos = [];
      if (files?.length) {
        for (let i = 0; i < Math.min(files.length, MAX_FILES); i++) {
          photos.push(await fileToAttachment(files[i]));
        }
      }

      const res = await fetch('/api/admin/realisations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify({ ...form, photos }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Erreur lors de l’envoi.');

      setForm({ titre: '', description: '', date: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccess('Réalisation ajoutée.');
      await load(authHeader);
      setTimeout(() => formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Supprimer cette réalisation ? Cette action est irréversible.');
    if (!ok) return;
    setDeleteBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/realisations/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: authHeader },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Erreur suppression (${res.status})`);
      setSuccess('Réalisation supprimée.');
      await load(authHeader);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur suppression.');
    } finally {
      setDeleteBusy(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="py-12 lg:py-20">
        <section className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">Admin réalisations</h1>
          <p className="text-gray-400 mb-8">Authentification requise.</p>
          <form onSubmit={handleLogin} className="space-y-4 bg-dark-lighter rounded-lg border border-gray-800 p-6">
            <input
              type="text"
              required
              placeholder="Identifiant admin"
              value={loginUser}
              onChange={(e) => setLoginUser(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
            />
            <input
              type="password"
              required
              placeholder="Mot de passe"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
            />
            {error ? (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">{error}</div>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-4 bg-primary text-white font-semibold hover:bg-primary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">Admin réalisations</h1>
        <p className="text-gray-400 mb-8">Ajoutez une réalisation : elle apparaîtra sur <span className="text-gray-200 font-medium">/realisations</span>.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-dark-lighter rounded-lg border border-gray-800 p-6">
            <div ref={formTopRef} />
            <h2 className="font-display text-2xl text-white mb-4">Ajouter une réalisation</h2>
            {error ? <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm mb-4">{error}</div> : null}
            {success ? <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-300 text-sm mb-4">{success}</div> : null}

            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Titre *"
                value={form.titre}
                onChange={(e) => update('titre', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
              <input
                type="text"
                placeholder="Date (optionnel) – ex: Mars 2026"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
              <textarea
                rows={4}
                required
                placeholder="Description *"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                multiple
                className="w-full"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full py-4 bg-primary text-white font-semibold hover:bg-primary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? 'Envoi…' : 'Ajouter'}
              </button>
            </form>
          </div>

          <div className="bg-dark-lighter rounded-lg border border-gray-800 p-6">
            <h2 className="font-display text-2xl text-white mb-4">Réalisations existantes</h2>
            {realisations.length === 0 ? (
              <p className="text-gray-400">Aucune réalisation pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {realisations
                  .slice()
                  .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
                  .map((r) => (
                    <div key={r.id} className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-white font-medium break-words">{r.titre}</div>
                        {r.date ? <div className="text-gray-400 text-sm">{r.date}</div> : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        disabled={deleteBusy}
                        className="shrink-0 px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/25 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteBusy ? '...' : 'Supprimer'}
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

