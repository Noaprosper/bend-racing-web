import { SITE } from '../data/site';

const valeurs = [
  'Expertise mécanique',
  'Passion moto',
  'Transparence',
  'Performance',
];

export default function APropos() {
  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-8">
          L'histoire de Bend Racing
        </h1>
        <div className="max-w-3xl space-y-6 text-gray-300">
          <p>
            Bend Racing est né de la passion du deux-roues et de la mécanique de précision. Notre atelier est installé à {SITE.location.city}, entre Cannes et Le Cannet, pour servir les motards des Alpes-Maritimes.
          </p>
          <p>
            Notre objectif est simple : offrir aux motards un service technique de haute qualité, que ce soit pour l'entretien, la préparation ou la performance moteur.
          </p>
          <p>
            Chaque machine qui passe dans notre atelier de {SITE.location.city} est traitée avec le même niveau d'exigence et de précision.
          </p>
        </div>

        <h2 className="font-display text-2xl text-white mt-16 mb-6">Nos valeurs</h2>
        <div className="flex flex-wrap gap-4">
          {valeurs.map((v) => (
            <span
              key={v}
              className="px-6 py-3 bg-dark-lighter border border-gray-700 rounded text-gray-300"
            >
              {v}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
