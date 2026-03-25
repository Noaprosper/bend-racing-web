import { Link } from 'react-router-dom';
import { SITE } from '../data/site';

const services = [
  'Reprogrammation',
  'Optimisation admission',
  'Ligne échappement',
  'Préparation moteur',
  'Réglage injection',
  'Optimisation transmission',
];

const benefits = [
  'Puissance',
  'Accélération',
  'Fiabilité',
  'Comportement moteur',
];

export default function Preparation() {
  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
          Préparation moteur à {SITE.location.city} – Cannes, Le Cannet
        </h1>
        <p className="max-w-2xl text-gray-400 mb-12">
          Chez Bend Racing, atelier basé à {SITE.location.city} (06), la performance est une passion. Nous préparons les moteurs pour améliorer :
        </p>
        <ul className="flex flex-wrap gap-4 mb-16">
          {benefits.map((b) => (
            <li key={b} className="px-4 py-2 bg-primary/20 text-primary rounded border border-primary/50">
              {b}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {services.map((s) => (
            <div key={s} className="p-6 bg-dark-lighter rounded-lg border border-gray-800">
              <h3 className="font-display text-xl text-white">{s}</h3>
            </div>
          ))}
        </div>

        <section className="p-8 bg-dark-lighter rounded-lg border-2 border-primary">
          <h2 className="font-display text-2xl text-primary mb-4">
            Préparation piste / racing
          </h2>
          <p className="text-gray-300">
            Pour les passionnés de circuit, nous proposons des préparations spécifiques track-day et racing avec optimisation complète : moteur, châssis, électronique.
          </p>
          <Link
            to="/devis"
            className="inline-block mt-4 px-6 py-2 bg-primary text-white font-medium hover:bg-primary-dark rounded"
          >
            Demander un devis
          </Link>
        </section>
      </section>
    </div>
  );
}
