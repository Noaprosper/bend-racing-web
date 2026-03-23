import { Link } from 'react-router-dom';
import { SITE } from '../data/site';

const services = [
  'Révision complète',
  'Changement consommables',
  'Diagnostic moteur',
  'Remplacement pièces',
  'Réparation mécanique',
  'Électronique et injection',
];

const operations = [
  'Vidange',
  'Kit chaîne',
  'Plaquettes',
  'Embrayage',
  'Suspension',
  'Injection',
];

export default function Atelier() {
  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
          Atelier moto à {SITE.location.city}, proche Cannes et Le Cannet
        </h1>
        <p className="max-w-2xl text-gray-400 mb-12">
          Notre atelier à {SITE.location.city} (06) prend en charge l'entretien et la réparation de motos et scooters toutes marques. Accessible depuis Cannes, Le Cannet et les communes environnantes.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-2xl text-white mb-4">Services</h2>
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s} className="flex items-center gap-2 text-gray-300">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl text-white mb-4">Opérations courantes</h2>
            <ul className="space-y-2">
              {operations.map((o) => (
                <li key={o} className="flex items-center gap-2 text-gray-300">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/rendez-vous"
            className="inline-flex px-10 py-4 bg-primary text-white font-semibold hover:bg-primary-dark transition-colors rounded"
          >
            Prendre rendez-vous atelier
          </Link>
        </div>
      </section>
    </div>
  );
}
