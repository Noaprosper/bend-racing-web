# bend-racing-web – Manifests Kubernetes

Manifests appliqués sur le cluster Scaleway. Versionner sur GitHub et réappliquer avec `kubectl apply -f .`

## Fichiers (ordre d’apply)

1. `ingress-nginx-controller.yaml` – NGINX Ingress + LoadBalancer (LB externe)
2. `namespace.yaml` – Namespace bend-racing-web
3. `deployment.yaml` – Application
4. `service.yaml` – Service ClusterIP
5. `ingress.yaml` – Route HTTP vers l’app

```bash
kubectl apply -f ~/Desktop/bend-racing-web/
```
