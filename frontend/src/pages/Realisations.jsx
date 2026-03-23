import { SITE } from '../data/site';

const projets = [
  { id: 1, titre: 'Yamaha MT-09 Full exhaust', desc: 'Échappement complet, reprogrammation, gain +15ch' },
  { id: 2, titre: 'Kawasaki Z900 préparation piste', desc: 'Préparation circuit, suspensions, freinage' },
  { id: 3, titre: 'Honda CBR moteur ouvert', desc: 'Révision complète, réglage distribution' },
];

export default function Realisations() {
  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
          Nos réalisations
        </h1>
        <p className="max-w-2xl text-gray-400 mb-12">
          Préparations moteur, motos modifiées et transformations réalisées dans notre atelier à {SITE.location.city}, entre Cannes et Le Cannet.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projets.map(({ id, titre, desc }) => (
            <article key={id} className="bg-dark-lighter rounded-lg border border-gray-800 overflow-hidden">
              <div className="aspect-video bg-gray-800 flex items-center justify-center text-gray-600">
                Galerie photos projet {id}
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl text-white">{titre}</h3>
                <p className="text-gray-400 mt-2">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
