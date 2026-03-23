import { useState } from 'react';
import { SITE } from '../data/site';

const types = [
  { value: 'entretien', label: 'Entretien' },
  { value: 'reparation', label: 'Réparation' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'preparation', label: 'Préparation moteur' },
];

export default function RendezVous() {
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [moto, setMoto] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
          Prendre rendez-vous
        </h1>
        <p className="text-gray-400 mb-12">
          Réservez directement en ligne pour notre atelier à {SITE.location.city} (proche Cannes et Le Cannet). Sélectionnez le type d'intervention, une date et une heure.
        </p>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type d'intervention</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Heure</label>
              <input
                type="time"
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Moto</label>
            <input
              type="text"
              placeholder="Marque, modèle, année"
              value={moto}
              onChange={(e) => setMoto(e.target.value)}
              className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description du problème</label>
            <textarea
              rows={4}
              placeholder="Décrivez brièvement l'intervention souhaitée..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-200"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-primary text-white font-semibold hover:bg-primary-dark rounded"
          >
            Valider ma réservation
          </button>
        </form>
      </section>
    </div>
  );
}
