import { SITE } from '../data/site';

const categories = [
  {
    title: 'Consommables',
    items: ['Plaquettes', 'Filtres', 'Bougies', 'Huiles'],
  },
  {
    title: 'Performance',
    items: ['Échappements', 'Admission', 'ECU', 'Kits performance'],
  },
  {
    title: 'Partie cycle',
    items: ['Suspensions', 'Freins', 'Transmission'],
  },
];

export default function Pieces() {
  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
          Pièces détachées moto – {SITE.location.city}, Cannes, Le Cannet
        </h1>
        <p className="max-w-2xl text-gray-400 mb-16">
          Large catalogue pour l'entretien et la performance. Notre entrepôt à {SITE.location.city} (06) sert les motards de Cannes, Le Cannet et des environs. Consultez notre stock et demandez un devis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map(({ title, items }) => (
            <div key={title} className="p-6 bg-dark-lighter rounded-lg border border-gray-800">
              <h2 className="font-display text-xl text-primary mb-4">{title}</h2>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="text-gray-300">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap gap-4">
          <button className="px-8 py-3 bg-primary text-white font-medium hover:bg-primary-dark rounded">
            Commander
          </button>
          <button className="px-8 py-3 border border-primary text-primary font-medium hover:bg-primary hover:text-white rounded">
            Demander un devis
          </button>
        </div>
      </section>
    </div>
  );
}
