import { useRef, useState } from 'react';
import { SITE } from '../data/site';

const MAX_FILES = 5;
const MAX_FILE_BYTES = 1.9 * 1024 * 1024;

const operations = [
  { value: 'revision', label: 'Révision' },
  { value: 'vidange', label: 'Vidange' },
  { value: 'freinage', label: 'Freinage (plaquettes/disques)' },
  { value: 'pneus', label: 'Pneus' },
  { value: 'kit_chaine', label: 'Kit chaîne' },
  { value: 'embrayage', label: 'Embrayage' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'injection', label: 'Injection / réglage injection' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'reparation', label: 'Réparation mécanique' },
  { value: 'preparation', label: 'Préparation moteur / performance' },
  { value: 'autre', label: 'Autre' },
];

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

export default function Devis() {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    operation: '',
    operation_autre: '',
    telephone: '',
    email: '',
    vehicule: '',
    commentaire: '',
    attachments: [],
  });

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      if (!form.nom.trim() || !form.prenom.trim()) {
        setStatus({ type: 'error', message: 'Nom et prénom sont obligatoires.' });
        return;
      }
      if (!form.operation) {
        setStatus({ type: 'error', message: 'Choisissez une opération.' });
        return;
      }
      if (form.operation === 'autre' && !form.operation_autre.trim()) {
        setStatus({ type: 'error', message: 'Précisez l’opération pour « Autre ».' });
        return;
      }
      if (!form.vehicule.trim()) {
        setStatus({ type: 'error', message: 'Le véhicule est obligatoire.' });
        return;
      }
      const hasPhone = !!form.telephone.trim();
      const hasEmail = !!form.email.trim();
      if (!hasPhone && !hasEmail) {
        setStatus({ type: 'error', message: 'Téléphone ou email sont obligatoires.' });
        return;
      }

      const files = fileInputRef.current?.files;
      const attachments = [];
      if (files?.length) {
        for (let i = 0; i < Math.min(files.length, MAX_FILES); i++) {
          attachments.push(await fileToAttachment(files[i]));
        }
      }

      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          operation: form.operation,
          operation_autre: form.operation === 'autre' ? form.operation_autre : '',
          telephone: form.telephone,
          email: form.email,
          vehicule: form.vehicule,
          commentaire: form.commentaire,
          attachments,
        }),
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
          nom: '',
          prenom: '',
          operation: '',
          operation_autre: '',
          telephone: '',
          email: '',
          vehicule: '',
          commentaire: '',
          attachments: [],
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const msg = data.details
          ? `${data.error || 'Une erreur s’est produite.'} (${data.details})`
          : data.error || 'Une erreur s’est produite.';
        setStatus({ type: 'error', message: msg });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erreur de connexion. Réessayez plus tard.',
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
              Nous avons bien pris en compte votre demande de devis.
            </p>
            <p className="text-gray-400 mb-8">
              Nous vous recontacterons rapidement par téléphone ou email.
            </p>
            <button
              type="button"
              onClick={() => setStatus(null)}
              className="inline-flex px-8 py-3 border border-gray-600 text-gray-300 hover:border-primary hover:text-primary rounded transition-colors"
            >
              Envoyer un autre devis
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
          Demander un devis
        </h1>
        <p className="text-gray-400 mb-10">
          Atelier basé à {SITE.location.city} (proche Cannes et Le Cannet). Les champs marqués * sont obligatoires.
        </p>

        <form
          method="post"
          action="#"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
              <input
                type="text"
                required
                placeholder="Votre nom"
                value={form.nom}
                onChange={(e) => update('nom', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
              <input
                type="text"
                required
                placeholder="Votre prénom"
                value={form.prenom}
                onChange={(e) => update('prenom', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type d’opération *</label>
            <select
              value={form.operation}
              onChange={(e) => update('operation', e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
            >
              <option value="">Choisir...</option>
              {operations.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {form.operation === 'autre' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Autre (précisez) *</label>
              <input
                type="text"
                required
                placeholder="Ex: Étanchéité fourche, changement batterie..."
                value={form.operation_autre}
                onChange={(e) => update('operation_autre', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
              <input
                type="tel"
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
                placeholder="votre@email.fr"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Véhicule *</label>
            <input
              type="text"
              required
              placeholder="Marque, modèle, année"
              value={form.vehicule}
              onChange={(e) => update('vehicule', e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Commentaire</label>
            <textarea
              rows={4}
              placeholder="Décrivez votre besoin (symptômes, pièces déjà changées, historique...)"
              value={form.commentaire}
              onChange={(e) => update('commentaire', e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-200"
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
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-white file:font-medium"
            />
          </div>

          {status?.type === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-semibold hover:bg-primary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
          </button>
        </form>
      </section>
    </div>
  );
}

