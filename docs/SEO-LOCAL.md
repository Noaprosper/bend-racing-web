# Référencement local – Bend Racing (Mougins, Cannes, Le Cannet)

## Ce qui a été mis en place

### SEO technique
- **Meta tags** : description, keywords, canonical, geo.region, geo.placename
- **Open Graph** : pour le partage sur les réseaux sociaux
- **Schema.org LocalBusiness** (JSON-LD) : données structurées pour Google (atelier, adresse, zone desservie)
- **robots.txt** : autorise l’indexation, indique le sitemap
- **sitemap.xml** : liste toutes les pages du site

### Contenu géolocalisé
- Toutes les pages mentionnent Mougins, Cannes, Le Cannet (06)
- Texte adapté : « atelier à Mougins », « proche Cannes et Le Cannet », « Alpes-Maritimes »
- Carte sur la page Contact (OpenStreetMap, remplaçable par Google Maps)

## À faire pour améliorer le référencement

### 1. Google Search Console
1. Aller sur [search.google.com/search-console](https://search.google.com/search-console)
2. Ajouter la propriété `https://bend-racing.fr`
3. Vérifier la propriété (balise HTML ou DNS)
4. Soumettre le sitemap : `https://bend-racing.fr/sitemap.xml`

### 2. Google Business Profile (ex-Google My Business)
1. Créer une fiche sur [business.google.com](https://business.google.com)
2. Renseigner : nom, adresse exacte, téléphone, horaires, photos
3. Choisir les catégories : « Atelier de réparation de motos », « Vendeur de motos »
4. Zone de desserte : Mougins, Cannes, Le Cannet, Alpes-Maritimes

### 3. Compléter les données dans `src/data/site.js`
- **street** : adresse exacte (rue, numéro)
- **contact.phone** : numéro de téléphone
- **mapsEmbedUrl** : URL embed Google Maps (Partager > Intégrer une carte) avec l’adresse exacte

### 4. Avis clients
Les avis Google favorisent le référencement local. Encourager les clients satisfaits à laisser un avis.

## Mots-clés ciblés

- atelier moto Mougins
- préparation moteur Cannes
- réparation moto Le Cannet
- moto 06
- atelier deux-roues Alpes-Maritimes
