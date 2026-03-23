import { Link } from 'react-router-dom';
import { SITE } from '../data/site';

export default function Vehicules() {
  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">
          Véhicules
        </h1>
        <p className="text-gray-400 mb-12">
          Nous proposons l'achat et la reprise de motos neuves et d'occasion contrôlées par notre atelier à {SITE.location.city}, proche Cannes et Le Cannet (06).
        </p>

        {/* Aucune moto disponible */}
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

        {/* Reprise */}
        <section className="mt-20 p-8 bg-dark-lighter rounded-lg border border-gray-800">
          <h2 className="font-display text-2xl text-white mb-4">
            Reprise de votre moto
          </h2>
          <p className="text-gray-400 mb-6">
            Vous souhaitez vendre votre moto ? Nous proposons la reprise ou le dépôt-vente.
          </p>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <input type="text" placeholder="Modèle" className="px-4 py-3 bg-dark border border-gray-700 rounded" />
            <input type="text" placeholder="Kilométrage" className="px-4 py-3 bg-dark border border-gray-700 rounded" />
            <input type="file" accept="image/*" multiple className="px-4 py-3 bg-dark border border-gray-700 rounded col-span-2" />
            <button type="submit" className="px-6 py-3 bg-primary text-white font-medium hover:bg-primary-dark rounded">
              Envoyer ma demande
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}
