import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Accueil from './pages/Accueil';
import Vehicules from './pages/Vehicules';
import Atelier from './pages/Atelier';
import Preparation from './pages/Preparation';
import Pieces from './pages/Pieces';
import RendezVous from './pages/RendezVous';
import APropos from './pages/APropos';
import Realisations from './pages/Realisations';
import Contact from './pages/Contact';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Accueil />} />
          <Route path="vehicules" element={<Vehicules />} />
          <Route path="atelier" element={<Atelier />} />
          <Route path="preparation" element={<Preparation />} />
          <Route path="pieces" element={<Pieces />} />
          <Route path="rendez-vous" element={<RendezVous />} />
          <Route path="a-propos" element={<APropos />} />
          <Route path="realisations" element={<Realisations />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
