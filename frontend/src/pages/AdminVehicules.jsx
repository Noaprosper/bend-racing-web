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
      resolve({
        name: file.name,
        type: file.type || 'image/jpeg',
        content: b64,
      });
    };
    r.onerror = () => reject(new Error('Impossible de lire un fichier.'));
    r.readAsDataURL(file);
  });
}

function buildBasicAuth(user, pass) {
  // Login/mdp ASCII attendu (sinon il faudrait convertir en bytes UTF-8)
  return `Basic ${btoa(`${user}:${pass}`)}`;
}

export default function AdminVehicules() {
  const fileInputRef = useRef(null);
  const formTopRef = useRef(null);

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authHeader, setAuthHeader] = useState('');
  const [loginError, setLoginError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [vehiclesPreview, setVehiclesPreview] = useState([]);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    marque: '',
    modele: '',
    annee: '',
    kilometrage: '',
    prix: '',
    type: '',
    description: '',
    photos: [],
  });

  const loggedIn = useMemo(() => !!authHeader, [authHeader]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setBusy(true);

    try {
      const header = buildBasicAuth(loginUser, loginPass);
      const res = await fetch('/api/admin/vehicles', {
        headers: { Authorization: header },
      });
      if (!res.ok) {
        setLoginError('Identifiants incorrects (ou admin pas configuré côté backend).');
        return;
      }
      const data = await res.json();
      setVehiclesPreview(data.vehicles || []);
      setAuthHeader(header);
    } catch {
      setLoginError('Impossible de joindre l’API. Vérifiez le site puis réessayez.');
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setBusy(true);
    setLoginError('');
    setUploadSuccess('');

    try {
      const files = fileInputRef.current?.files;
      const photos = [];
      if (files?.length) {
        for (let i = 0; i < Math.min(files.length, MAX_FILES); i++) {
          photos.push(await fileToAttachment(files[i]));
        }
      }

      const body = {
        marque: form.marque,
        modele: form.modele,
        annee: form.annee || undefined,
        kilometrage: form.kilometrage,
        prix: form.prix || undefined,
        type: form.type || undefined,
        description: form.description,
        photos,
      };

      const res = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginError(data?.error || 'Erreur lors de l’envoi.');
        return;
      }

      // Reload preview
      const previewRes = await fetch('/api/admin/vehicles', {
        headers: { Authorization: authHeader },
      });
      const previewData = await previewRes.json().catch(() => ({}));
      setVehiclesPreview(previewData.vehicles || []);

      setForm({
        marque: '',
        modele: '',
        annee: '',
        kilometrage: '',
        prix: '',
        type: '',
        description: '',
        photos: [],
      });
      if (fileInputRef.current) fileInputRef.current.value = '';

      setUploadSuccess('Véhicule ajouté. Vous pouvez en ajouter un autre.');
      setTimeout(() => {
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    const ok = window.confirm('Supprimer ce véhicule ? Cette action est irréversible.');
    if (!ok) return;

    setDeleteBusy(true);
    setDeleteError('');
    setDeleteSuccess('');
    try {
      const res = await fetch(`/api/admin/vehicles/${encodeURIComponent(vehicleId)}`, {
        method: 'DELETE',
        headers: { Authorization: authHeader },
      });
      const raw = await res.text().catch(() => '');
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }
      if (!res.ok) {
        const msg = data?.error || `Erreur lors de la suppression (${res.status})`;
        throw new Error(msg);
      }

      setDeleteSuccess('Véhicule supprimé.');
      // Rafraîchir la prévisualisation
      const previewRes = await fetch('/api/admin/vehicles', {
        headers: { Authorization: authHeader },
      });
      const previewData = await previewRes.json().catch(() => ({}));
      setVehiclesPreview(previewData.vehicles || []);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    } finally {
      setDeleteBusy(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="py-12 lg:py-20">
        <section className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">Admin véhicules</h1>
          <p className="text-gray-400 mb-8">
            Authentification requise.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 bg-dark-lighter rounded-lg border border-gray-800 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Identifiant admin</label>
              <input
                type="text"
                required
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
            {loginError ? (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                {loginError}
              </div>
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">Admin véhicules</h1>
        <p className="text-gray-400 mb-8">
          Ajoutez un véhicule : il apparaîtra automatiquement sur <span className="text-gray-200 font-medium">/vehicules</span>.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-dark-lighter rounded-lg border border-gray-800 p-6">
            <h2 className="font-display text-2xl text-white mb-4">Ajouter un véhicule</h2>
            <div ref={formTopRef} />
            {uploadSuccess ? (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-300 text-sm mb-4 flex items-center justify-between gap-4">
                <span>{uploadSuccess}</span>
                <button
                  type="button"
                  onClick={() => formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-200 rounded hover:bg-green-500/25 transition-colors"
                >
                  + Ajouter un autre
                </button>
              </div>
            ) : null}
            {deleteError ? (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm mb-4">
                {deleteError}
              </div>
            ) : null}
            {deleteSuccess ? (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-300 text-sm mb-4">
                {deleteSuccess}
              </div>
            ) : null}
            {loginError ? (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm mb-4">
                {loginError}
              </div>
            ) : null}

            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Marque *</label>
                <input
                  type="text"
                  required
                  value={form.marque}
                  onChange={(e) => update('marque', e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Modèle *</label>
                <input
                  type="text"
                  required
                  value={form.modele}
                  onChange={(e) => update('modele', e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Année</label>
                  <input
                    type="text"
                    value={form.annee}
                    onChange={(e) => update('annee', e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
                    placeholder="Ex: 2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kilométrage *</label>
                  <input
                    type="text"
                    required
                    value={form.kilometrage}
                    onChange={(e) => update('kilometrage', e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
                    placeholder="Ex: 12 000 km"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prix</label>
                  <input
                    type="text"
                    value={form.prix}
                    onChange={(e) => update('prix', e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
                    placeholder="Ex: 8500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type (optionnel)</label>
                  <input
                    type="text"
                    value={form.type}
                    onChange={(e) => update('type', e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
                    placeholder="moto / scooter / autre"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
                  placeholder="Etat, historique, points forts…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Photos (optionnel, max {MAX_FILES} fichiers)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  multiple
                  className="w-full"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full py-4 bg-primary text-white font-semibold hover:bg-primary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? 'Envoi…' : 'Ajouter le véhicule'}
              </button>
            </form>
          </div>

          <div className="bg-dark-lighter rounded-lg border border-gray-800 p-6">
            <h2 className="font-display text-2xl text-white mb-4">Véhicules existants</h2>
            {vehiclesPreview.length === 0 ? (
              <p className="text-gray-400">Aucun véhicule pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {vehiclesPreview
                  .slice()
                  .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
                  .map((v) => (
                    <div key={v.id} className="flex gap-4 items-start justify-between">
                      <div className="flex gap-4 items-start min-w-0">
                        <div className="w-16 h-16 bg-dark rounded overflow-hidden flex items-center justify-center text-gray-500 text-xs shrink-0">
                          {Array.isArray(v.photos) && v.photos[0]?.filename ? (
                            <img
                              src={`/media/${v.id}/${encodeURIComponent(v.photos[0].filename)}`}
                              alt={`${v.marque} ${v.modele}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            'Photo'
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-medium break-words">
                            {v.marque} {v.modele}{v.annee ? ` (${v.annee})` : ''}
                          </div>
                          <div className="text-gray-400 text-sm break-words">
                            {v.kilometrage ? `Kilométrage : ${v.kilometrage}` : ''}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(v.id)}
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

