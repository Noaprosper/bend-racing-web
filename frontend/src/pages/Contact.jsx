import { Link } from 'react-router-dom';
import { SITE } from '../data/site';
import YouTubeVideos from '../components/YouTubeVideos';

export default function Contact() {
  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <img src="/logo.png" alt="" className="h-16 w-auto" />
          <span className="font-display text-3xl text-white tracking-wider">Bend Racing</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
          Contact
        </h1>
        <p className="text-gray-400 mb-12">
          Notre atelier est situé à {SITE.location.city}, entre Cannes et Le Cannet (06). N'hésitez pas à nous contacter.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="" className="h-10 w-auto" />
              <h2 className="font-display text-2xl text-white tracking-wider">Bend Racing – Mougins</h2>
            </div>
            <div className="space-y-2 text-gray-400">
              <p><span className="text-gray-500">Adresse :</span> {SITE.location.fullAddress}</p>
              {SITE.contact.phone && <p><span className="text-gray-500">Téléphone :</span> {SITE.contact.phone}</p>}
              <p><span className="text-gray-500">Email :</span> {SITE.contact.email}</p>
            </div>
            <div className="mt-6 flex gap-4">
              {SITE.contact.phone && (
                <a href={`tel:${SITE.contact.phone}`} className="px-6 py-3 bg-primary text-white font-medium rounded hover:bg-primary-dark">
                  Appeler
                </a>
              )}
              <Link to="/rendez-vous" className="px-6 py-3 border border-primary text-primary font-medium rounded hover:bg-primary hover:text-white">
                Prendre rendez-vous
              </Link>
            </div>
            <div className="mt-8 rounded-lg border border-gray-800 overflow-hidden">
              <iframe
                title="Carte Bend Racing - 56 chemin de Provence, Mougins"
                src={SITE.location.mapsEmbedUrl}
                width="100%"
                height="256"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-90 hover:opacity-100 hover:grayscale-0 transition-all w-full"
              />
              <a
                href={SITE.location.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-3 px-4 bg-dark-lighter text-primary hover:bg-dark text-sm font-medium text-center"
              >
                Voir l'itinéraire / Ouvrir dans Google Maps →
              </a>
            </div>
            <div className="mt-8">
              <YouTubeVideos count={4} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
