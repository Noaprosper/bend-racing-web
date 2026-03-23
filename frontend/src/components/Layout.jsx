import { Link, Outlet } from 'react-router-dom';
import { useState } from 'react';

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/vehicules', label: 'Véhicules' },
  { to: '/atelier', label: 'Atelier / Réparation' },
  { to: '/preparation', label: 'Préparation & Performance' },
  { to: '/pieces', label: 'Pièces détachées' },
  { to: '/rendez-vous', label: 'Prendre rendez-vous' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/realisations', label: 'Actualités / réalisations' },
  { to: '/contact', label: 'Contact' },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-sm border-b border-gray-800">
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
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
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
            {navLinks.map(({ to, label }) => (
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
                {navLinks.slice(0, 5).map(({ to, label }) => (
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
