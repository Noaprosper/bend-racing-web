import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../data/site';

export default function Accueil() {
  const [realisations, setRealisations] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/realisations');
        const data = await res.json();
        if (!cancelled) setRealisations(data.realisations || []);
      } catch {
        if (!cancelled) setRealisations([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-dark via-dark-lighter to-dark overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
          <div className="max-w-3xl">
            <h1 className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <img
                src="/logo.png"
                alt=""
                className="h-24 sm:h-32 lg:h-40 w-auto drop-shadow-lg"
              />
              <span className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wider drop-shadow-lg">
                Bend Racing
              </span>
            </h1>
            <p className="mt-4 text-xl sm:text-2xl text-gray-200 font-light">
              Spécialiste 2 roues – Achat, préparation et performance moteur.
            </p>
            <p className="mt-2 text-gray-400">
              Atelier basé à {SITE.location.city}, proche de Cannes et Le Cannet (06).
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/vehicules"
                className="inline-flex justify-center px-8 py-4 bg-primary text-white font-semibold hover:bg-primary-dark transition-colors rounded"
              >
                Véhicules & reprise
              </Link>
              <Link
                to="/rendez-vous"
                className="inline-flex justify-center px-8 py-4 border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors rounded"
              >
                Prendre rendez-vous atelier
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Présentation */}
      <section className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-8">
            L'univers Bend Racing
          </h2>
          <div className="max-w-3xl text-gray-300 space-y-4">
            <p>
              Bend Racing est un atelier spécialisé dans l'univers du deux-roues, situé à {SITE.location.city}, entre Cannes et Le Cannet.
              Nous accompagnons les passionnés de moto et scooter des Alpes-Maritimes dans l'achat, la préparation et l'entretien de leurs machines.
            </p>
            <p className="font-medium text-white">Notre expertise couvre :</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Achat et revente de motos</li>
              <li>Réparation et entretien</li>
              <li>Préparation moteur</li>
              <li>Optimisation performance</li>
              <li>Vente de pièces détachées</li>
            </ul>
            <p>
              Chaque projet est traité avec précision afin d'offrir le meilleur rendement, la meilleure fiabilité et les meilleures sensations de conduite.
            </p>
          </div>
        </div>
      </section>

      {/* Nos services */}
      <section className="py-20 bg-dark-lighter border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-12 text-center">
            Nos services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Achat / Revente de motos', desc: 'Reprise et dépôt-vente. Stock régulièrement renouvelé.', to: '/vehicules' },
              { title: 'Réparation et entretien', desc: 'Diagnostic, entretien complet et réparation mécanique.', to: '/atelier' },
              { title: 'Préparation moteur', desc: 'Optimisation performance et réglages spécifiques.', to: '/preparation' },
              { title: 'Pièces détachées et accessoires', desc: 'Large catalogue pour entretien et performance.', to: '/pieces' },
            ].map(({ title, desc, to }) => (
              <Link key={to} to={to} className="block p-6 bg-dark rounded-lg border border-gray-800 hover:border-primary transition-colors group">
                <h3 className="font-display text-xl text-white group-hover:text-primary">{title}</h3>
                <p className="mt-2 text-sm text-gray-400">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Réalisations (affiché uniquement si au moins 1 entrée existe) */}
      {realisations.length > 0 && (
        <section className="py-20 bg-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">
              Nos préparations
            </h2>
            <p className="max-w-2xl text-gray-400 mb-12">
              Chaque moto préparée dans notre atelier est le fruit d'un travail de précision et de passion mécanique.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {realisations.slice(0, 3).map((r) => (
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
                  <div className="p-4">
                    <h3 className="font-display text-lg text-white">{r.titre}</h3>
                  </div>
                </article>
              ))}
            </div>
            <Link to="/realisations" className="inline-block mt-8 text-primary hover:underline font-medium">
              Voir toutes nos réalisations →
            </Link>
          </div>
        </section>
      )}

      {/* Avis clients */}
      <section className="py-20 bg-dark-lighter border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-12 text-center">
            Avis clients
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              '« Préparation moteur incroyable. La moto a complètement changé de comportement. »',
              '« Équipe pro et réactive. Mon essai a été arrangé en 24h. »',
              '« Réparation effectuée avec soin. Je recommande à 100 %. »',
            ].map((quote, i) => (
              <blockquote key={i} className="p-6 bg-dark rounded-lg border border-gray-800">
                <p className="text-gray-300 italic">"{quote}"</p>
                <footer className="mt-3 text-sm text-gray-500">— Client Bend Racing</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Rendez-vous */}
      <section className="py-20 bg-dark">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">
            Besoin d'un diagnostic ou d'une préparation ?
          </h2>
          <p className="text-gray-400 mb-8">
            Prenez rendez-vous directement en ligne.
          </p>
          <Link
            to="/rendez-vous"
            className="inline-flex px-10 py-4 bg-primary text-white font-semibold hover:bg-primary-dark transition-colors rounded"
          >
            Réserver un créneau
          </Link>
        </div>
      </section>
    </div>
  );
}
