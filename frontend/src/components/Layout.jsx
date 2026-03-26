import { Link, Outlet } from 'react-router-dom';
import { useState } from 'react';

const navLinks = [
  { to: '/vehicules', label: 'Véhicules' },
  { to: '/devis', label: 'Devis' },
  { to: '/contact', label: 'Contact' },
];

const servicesLinks = [
  { to: '/atelier', label: 'Atelier' },
  { to: '/preparation', label: 'Préparation' },
  { to: '/pieces', label: 'Pièces' },
  { to: '/realisations', label: 'Réalisations' },
  { to: '/a-propos', label: 'À propos' },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <img
                src="/logo.png"
                alt=""
                className="h-10 lg:h-12 w-auto"
              />
              <span className="font-display text-xl lg:text-2xl text-white tracking-wider hidden sm:block">
                Bend Racing
              </span>
            </Link>
            <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
              <div
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => setServicesOpen((v) => !v)}
                  className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-300 hover:text-white transition-colors inline-flex items-center gap-2"
                  aria-expanded={servicesOpen}
                >
                  Services
                  <svg className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>
                {servicesOpen && (
                  <div className="absolute top-full left-0 mt-3 w-56 rounded-lg border border-gray-800 bg-dark-lighter shadow-xl overflow-hidden z-50">
                    {servicesLinks.map(({ to, label }) => (
                      <Link
                        key={to}
                        to={to}
                        className="block px-4 py-3 text-sm text-gray-300 hover:bg-dark hover:text-white transition-colors"
                        onClick={() => setServicesOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-300 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-300 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-800 bg-dark-lighter py-4 px-4">
            <Link
              to="/devis"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-gray-300 hover:text-primary"
            >
              Devis
            </Link>
            <Link
              to="/rendez-vous"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-gray-300 hover:text-primary"
            >
              Rendez-vous
            </Link>
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Services</div>
              {servicesLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-300 hover:text-primary"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800">
              {navLinks
                .filter((l) => l.to !== '/devis')
                .map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-300 hover:text-primary"
              >
                {label}
              </Link>
              ))}
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 pt-16 lg:pt-20">
        <Outlet />
      </main>
      <footer className="bg-dark-lighter border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt=""
                  className="h-12 w-auto"
                />
                <span className="font-display text-xl text-white tracking-wider">Bend Racing</span>
              </Link>
              <p className="mt-3 text-sm text-gray-400">
                Atelier moto à Mougins, proche Cannes et Le Cannet (06).
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-3">Navigation</h4>
              <div className="flex flex-col gap-2">
                {[...navLinks, { to: '/rendez-vous', label: 'Rendez-vous' }].slice(0, 5).map(({ to, label }) => (
                  <Link key={to} to={to} className="text-sm text-gray-400 hover:text-primary">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white mb-3">Contact</h4>
              <Link to="/rendez-vous" className="inline-block px-6 py-2 bg-primary text-white font-medium hover:bg-primary-dark transition-colors rounded">
                Prendre rendez-vous
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Bend Racing. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
