import { useState } from 'react';
import { SITE } from '../data/site';

const types = [
  { value: 'entretien', label: 'Entretien' },
  { value: 'reparation', label: 'Réparation' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'preparation', label: 'Préparation moteur' },
];

export default function RendezVous() {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    type: '',
    date: '',
    heure: '',
    moto: '',
    description: '',
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch('/api/rdv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: res.ok ? 'Réponse invalide' : `Erreur serveur (${res.status})` };
      }

      if (res.ok) {
        setStatus({ type: 'success', message: 'Demande envoyée ! Nous vous recontacterons rapidement.' });
        setForm({ nom: '', email: '', telephone: '', type: '', date: '', heure: '', moto: '', description: '' });
      } else {
        const msg = data.details
          ? `${data.error || "Une erreur s'est produite."} (${data.details})`
          : data.error || "Une erreur s'est produite.";
        setStatus({ type: 'error', message: msg });
      }
    } catch (err) {
      setStatus({ type: 'error', message: "Erreur de connexion. Vérifiez que le site est bien en ligne et réessayez." });
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

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
              Nous avons bien pris en compte votre demande de rendez-vous.
            </p>
            <p className="text-gray-400 mb-8">
              Nous vous recontacterons rapidement par email ou téléphone pour confirmer votre créneau.
            </p>
            <button
              type="button"
              onClick={() => setStatus(null)}
              className="inline-flex px-8 py-3 border border-gray-600 text-gray-300 hover:border-primary hover:text-primary rounded transition-colors"
            >
              Faire une autre demande
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
          Prendre rendez-vous
        </h1>
        <p className="text-gray-400 mb-12">
          Réservez directement en ligne pour notre atelier à {SITE.location.city} (proche Cannes et Le Cannet). Sélectionnez le type d'intervention, une date et une heure.
        </p>

        <form
          method="post"
          action="#"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
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
                className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                required
                placeholder="votre@email.fr"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
            <input
              type="tel"
              placeholder="06 12 34 56 78"
              value={form.telephone}
              onChange={(e) => update('telephone', e.target.value)}
              className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type d'intervention</label>
            <select
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-200"
            >
              <option value="">Choisir...</option>
              {types.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date souhaitée</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Heure souhaitée</label>
              <input
                type="time"
                value={form.heure}
                onChange={(e) => update('heure', e.target.value)}
                className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Moto</label>
            <input
              type="text"
              placeholder="Marque, modèle, année"
              value={form.moto}
              onChange={(e) => update('moto', e.target.value)}
              className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              rows={4}
              placeholder="Décrivez brièvement l'intervention souhaitée..."
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-200"
            />
          </div>
          {status?.type === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400">
              {status.message}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-semibold hover:bg-primary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi en cours...' : 'Valider ma demande'}
          </button>
        </form>
      </section>
    </div>
  );
}
