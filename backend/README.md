# Bend Racing API – Transactional Email (TEM)

API backend pour envoyer les demandes de rendez-vous via Scaleway TEM.

## Variables d'environnement

- `SCW_SECRET_KEY` – Clé secrète API Scaleway (obligatoire)
- `SCW_PROJECT_ID` – ID du projet Scaleway (obligatoire)
- `SCW_REGION` – Région (défaut : `fr-par`)
- `TO_EMAIL` – Email de réception (défaut : `contact@bend-racing.fr`)
- `FROM_EMAIL` – Email d'envoi (défaut : `rdv@rdv.bend-racing.fr`)

## Déploiement

### 1. Créer le Secret Kubernetes

```bash
kubectl create secret generic bend-racing-tem \
  --namespace bend-racing-web \
  --from-literal=scw-secret-key=VOTRE_CLE_SECRETE \
  --from-literal=scw-project-id=VOTRE_PROJECT_ID
```

### 2. Build et push de l'image

```bash
cd backend
docker build -t noaprosper/bend-racing-api:latest .
docker push noaprosper/bend-racing-api:latest
```

### 3. Appliquer les manifests

```bash
kubectl apply -f backend-deployment.yaml -f backend-service.yaml
kubectl apply -f ingress.yaml
```

## Endpoint

- `POST /api/rdv` – Envoie une demande de rendez-vous par email

Body attendu : `{ nom, email, telephone?, type?, date?, heure?, moto?, description? }`

## Dépannage (emails non reçus)

1. **Vérifier les logs du pod API** :
   ```bash
   kubectl logs -n bend-racing-web -l app=bend-racing-api --tail=50 -f
   ```
   En cas d'erreur TEM, le message exact Scaleway s'affiche.

2. **Domaine Scaleway TEM** : l'adresse d'envoi `rdv@rdv.bend-racing.fr` nécessite que le domaine `rdv.bend-racing.fr` soit configuré dans [Scaleway TEM](https://console.scaleway.com/transactional-email) avec les enregistrements SPF, DKIM et MX.

3. **Tester en local** :
   - Démarrer le backend : `cd backend && npm start`
   - Démarrer le frontend : `cd frontend && npm run dev` (le proxy envoie `/api` vers le backend)
