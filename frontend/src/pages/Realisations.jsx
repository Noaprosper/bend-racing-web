import { useEffect, useState } from 'react';
import { SITE } from '../data/site';

export default function Realisations() {
  const [realisations, setRealisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/realisations');
        const data = await res.json();
        if (!cancelled) setRealisations(data.realisations || []);
      } catch {
        if (!cancelled) setError('Impossible de charger les réalisations.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
          Nos réalisations
        </h1>
        <p className="max-w-2xl text-gray-400 mb-12">
          Préparations moteur, motos modifiées et transformations réalisées dans notre atelier à {SITE.location.city}, entre Cannes et Le Cannet.
        </p>

        {loading ? (
          <div className="py-16 px-8 bg-dark-lighter rounded-lg border border-gray-800 text-center text-gray-400">
            Chargement…
          </div>
        ) : error ? (
          <div className="py-16 px-8 bg-dark-lighter rounded-lg border border-gray-800 text-center text-red-400 text-sm">
            {error}
          </div>
        ) : realisations.length === 0 ? (
          <div className="py-16 px-8 bg-dark-lighter rounded-lg border border-gray-800 text-center">
            <p className="text-xl text-gray-300 mb-3">
              Aucune réalisation pour le moment.
            </p>
            <p className="text-gray-400">
              Revenez bientôt pour découvrir nos préparations et transformations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {realisations.map((r) => (
              <article key={r.id} className="bg-dark-lighter rounded-lg border border-gray-800 overflow-hidden">
                {r.photos?.[0]?.url ? (
                  <img
                    src={r.photos[0].url}
                    alt={r.titre}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-video bg-gray-800 flex items-center justify-center text-gray-600">
                    Pas de photo
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-display text-xl text-white">{r.titre}</h3>
                  {r.date ? <p className="text-gray-500 text-sm mt-1">{r.date}</p> : null}
                  <p className="text-gray-400 mt-2">{r.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
