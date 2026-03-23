# bend-racing-web – Manifests Kubernetes

Manifests appliqués sur le cluster Scaleway. Versionner sur GitHub et réappliquer avec `kubectl apply -f .`

Domaine : **bend-racing.fr** (HTTPS via Let's Encrypt)

## Prérequis

### 1. cert-manager (pour TLS Let's Encrypt)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.4/cert-manager.yaml
```

### 2. DNS

Récupérer l'IP externe du LoadBalancer :
```bash
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

Configurer chez votre registrar : **bend-racing.fr** et **www.bend-racing.fr** → A record → IP du LoadBalancer

## Fichiers (ordre d'apply)

1. `ingress-nginx-controller.yaml` – NGINX Ingress + LoadBalancer (LB externe)
2. `namespace.yaml` – Namespace bend-racing-web
3. `cluster-issuer.yaml` – ClusterIssuer Let's Encrypt (adapter l'email si besoin)
4. `deployment.yaml` – Application
5. `service.yaml` – Service ClusterIP
6. `ingress.yaml` – Route bend-racing.fr → app (TLS + redirection HTTP→HTTPS)

```bash
kubectl apply -f ~/Desktop/bend-racing-web/
```

## Build et push image Docker (Docker Hub, multi-arch)

Build pour **amd64** et **arm64**, push vers Docker Hub :

```bash
cd frontend
export DOCKERHUB_USER=ton-username   # ton identifiant Docker Hub
chmod +x build-multiarch.sh
./build-multiarch.sh
```

Puis dans `deployment.yaml`, remplacer `USER` par ton username et appliquer :

```bash
kubectl apply -f deployment.yaml -n bend-racing-web
kubectl rollout restart deployment bend-racing-web -n bend-racing-web
```

## Vérifier le certificat TLS

```bash
kubectl get certificate -n bend-racing-web
kubectl describe certificate bend-racing-tls -n bend-racing-web
```
