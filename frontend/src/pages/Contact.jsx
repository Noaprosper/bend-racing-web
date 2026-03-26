import { Link } from 'react-router-dom';
import { SITE } from '../data/site';
import YouTubeVideos from '../components/YouTubeVideos';

export default function Contact() {
  return (
    <div className="py-12 lg:py-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-4 text-center">
          Contact
        </h1>

        <div className="max-w-3xl mx-auto">
          <div className="bg-dark-lighter rounded-lg border border-gray-800 p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/logo.png" alt="" className="h-10 w-auto" />
              <h2 className="font-display text-2xl text-white tracking-wider">Bend Racing – Mougins</h2>
            </div>
            <div className="space-y-2 text-gray-400 text-center">
              <p><span className="text-gray-500">Adresse :</span> {SITE.location.fullAddress}</p>
              {SITE.contact.phone && <p><span className="text-gray-500">Téléphone :</span> {SITE.contact.phone}</p>}
              <p><span className="text-gray-500">Email :</span> {SITE.contact.email}</p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
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
            <div className="mt-8 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
                {SITE.social?.instagram && (
                  <a
                    href={SITE.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary font-medium rounded hover:bg-primary hover:text-white"
                  >
                    Suivez-nous sur Instagram
                  </a>
                )}
              </div>

              {/* Aperçu Instagram : compact + dépliable (embed parfois bloqué par Instagram). */}
              {SITE.social?.instagram && (
                <details className="mb-6 text-left rounded-lg border border-gray-800 bg-dark p-4">
                  <summary className="cursor-pointer select-none text-gray-300 font-medium">
                    Notre compte Instagram
                  </summary>
                  <div className="mt-4 rounded-lg border border-gray-800 overflow-hidden">
                    <iframe
                      title="Instagram Bend Racing"
                      src={`${SITE.social.instagram}embed`}
                      width="100%"
                      height="260"
                      style={{ border: 0 }}
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    Si l’aperçu ne s’affiche pas, utilisez le bouton « Suivez-nous sur Instagram ».
                  </p>
                </details>
              )}

              <YouTubeVideos count={4} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
