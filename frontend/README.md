# Bend Racing – Frontend

Site vitrine Bend Racing : spécialiste 2 roues (achat, préparation, réparation).

## Développement

```bash
# Corriger les permissions npm si nécessaire
sudo chown -R $(whoami) ~/.npm

# Installer les dépendances
npm install

# Lancer le serveur de dev
npm run dev
```

## Build

```bash
npm run build
```

## Docker

```bash
docker build -t bend-racing-web .
docker run -p 8080:80 bend-racing-web
```

Puis ouvrir http://localhost:8080

## Pages

- Accueil
- Véhicules (catalogue motos)
- Atelier / Réparation
- Préparation & Performance
- Pièces détachées
- Prendre rendez-vous
- À propos
- Réalisations
- Contact
