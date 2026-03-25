import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../data/site';

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

export default function Vehicules() {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    modele: '',
    kilometrage: '',
    message: '',
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Liste des véhicules (gérée via l'API admin + stockage persistant)
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setVehiclesLoading(true);
      setVehiclesError('');
      try {
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        if (!cancelled) setVehicles(data.vehicles || []);
      } catch {
        if (!cancelled) setVehiclesError('Impossible de charger la liste des véhicules.');
      } finally {
        if (!cancelled) setVehiclesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const files = fileInputRef.current?.files;
      const attachments = [];
      if (files?.length) {
        for (let i = 0; i < Math.min(files.length, MAX_FILES); i++) {
          attachments.push(await fileToAttachment(files[i]));
        }
      }

      const res = await fetch('/api/reprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, attachments }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: res.ok ? 'Réponse invalide' : `Erreur serveur (${res.status})` };
      }

      if (res.ok) {
        setStatus({ type: 'success' });
        setForm({
          prenom: '',
          nom: '',
          email: '',
          telephone: '',
          modele: '',
          kilometrage: '',
          message: '',
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const msg = data.details
          ? `${data.error || "Une erreur s'est produite."} (${data.details})`
          : data.error || "Une erreur s'est produite.";
        setStatus({ type: 'error', message: msg });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : "Erreur de connexion. Réessayez plus tard.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (status?.type === 'success') {
    return (
      <div className="py-12 lg:py-20">
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="py-16 px-8 bg-dark-lighter rounded-lg border border-gray-800">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-white mb-4">
              Demande bien reçue
            </h2>
            <p className="text-gray-300 text-lg mb-2">
              Nous avons bien pris en compte votre demande de reprise.
            </p>
            <p className="text-gray-400 mb-8">
              Nous vous recontacterons rapidement par téléphone ou email pour la suite.
            </p>
            <button
              type="button"
              onClick={() => setStatus(null)}
              className="inline-flex px-8 py-3 border border-gray-600 text-gray-300 hover:border-primary hover:text-primary rounded transition-colors"
            >
              Nouvelle demande de reprise
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">
          Véhicules
        </h1>
        <p className="text-gray-400 mb-12">
          Nous proposons l'achat et la reprise de motos neuves et d'occasion contrôlées par notre atelier à {SITE.location.city}, proche Cannes et Le Cannet (06).
        </p>

        {vehiclesLoading ? (
          <div className="py-16 px-8 bg-dark-lighter rounded-lg border border-gray-800 text-center text-gray-400">
            Chargement des véhicules…
          </div>
        ) : vehiclesError ? (
          <div className="py-16 px-8 bg-dark-lighter rounded-lg border border-gray-800 text-center text-red-400 text-sm">
            {vehiclesError}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-16 px-8 bg-dark-lighter rounded-lg border border-gray-800 text-center">
            <p className="text-xl text-gray-300 mb-4">
              Aucune moto disponible pour le moment.
            </p>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Notre stock est régulièrement renouvelé. Souhaitez-vous vendre ou mettre en dépôt-vente votre moto ? Utilisez le formulaire ci-dessous.
            </p>
            <Link
              to="/contact"
              className="inline-flex px-8 py-3 bg-primary text-white font-medium hover:bg-primary-dark rounded"
            >
              Nous contacter
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <article key={v.id} className="bg-dark-lighter rounded-lg border border-gray-800 overflow-hidden">
                {v.photos?.[0]?.url ? (
                  <img
                    src={v.photos[0].url}
                    alt={`${v.marque} ${v.modele}`}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-44 w-full bg-dark flex items-center justify-center text-gray-500 text-sm">
                    Pas de photo
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-display text-lg text-white mb-1">
                    {v.marque} {v.modele}{v.annee ? ` (${v.annee})` : ''}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {v.kilometrage ? `Kilométrage : ${v.kilometrage}` : 'Kilométrage : -'}
                  </p>
                  {v.prix ? (
                    <p className="text-primary text-sm mt-1 font-medium">
                      {`Prix : ${v.prix} €`}
                    </p>
                  ) : null}
                  <p className="text-gray-300 text-sm mt-3">
                    {v.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <section className="mt-20 p-8 bg-dark-lighter rounded-lg border border-gray-800">
          <h2 className="font-display text-2xl text-white mb-4">
            Reprise de votre moto
          </h2>
          <p className="text-gray-400 mb-6">
            Vous souhaitez vendre votre moto ? Nous proposons la reprise ou le dépôt-vente. Les champs marqués * sont obligatoires.
          </p>
          <form
            method="post"
            action="#"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl space-y-0"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
              <input
                type="text"
                required
                placeholder="Prénom"
                value={form.prenom}
                onChange={(e) => update('prenom', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
              <input
                type="text"
                required
                placeholder="Nom"
                value={form.nom}
                onChange={(e) => update('nom', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone *</label>
              <input
                type="tel"
                required
                placeholder="06 12 34 56 78"
                value={form.telephone}
                onChange={(e) => update('telephone', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                placeholder="votre@email.fr (recommandé)"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Modèle de la moto</label>
              <input
                type="text"
                placeholder="Marque, modèle, année"
                value={form.modele}
                onChange={(e) => update('modele', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Kilométrage</label>
              <input
                type="text"
                placeholder="Ex. 12 000 km"
                value={form.kilometrage}
                onChange={(e) => update('kilometrage', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea
                rows={3}
                placeholder="État général, historique, accessoires…"
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Photos (optionnel, max {MAX_FILES} fichiers, 1,9 Mo chacun)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                multiple
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-white file:font-medium"
              />
            </div>
            {status?.type === 'error' && (
              <div className="md:col-span-2 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                {status.message}
              </div>
            )}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-primary text-white font-semibold hover:bg-primary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi en cours…' : 'Envoyer ma demande'}
              </button>
            </div>
          </form>
        </section>
      </section>
    </div>
  );
}
