# Correction DNS : CoreDNS ne résout pas les domaines externes

Si cert-manager échoue avec `lookup bend-racing.fr on 10.32.0.10:53: no such host`, le DNS du cluster (CoreDNS) n'arrive pas à résoudre les domaines externes.

## Solution : configurer CoreDNS pour utiliser des DNS publics

### 1. Voir la config actuelle

```bash
kubectl get configmap coredns -n kube-system -o yaml
```

### 2. Modifier la config

Recherche la ligne `forward .` dans le Corefile. Elle ressemble à :
```
forward . /etc/resolv.conf
```
ou
```
forward . 10.32.0.10
```

Remplace-la par :
```
forward . 8.8.8.8 1.1.1.1
```

**Méthode A – Édition manuelle :**
```bash
kubectl edit configmap coredns -n kube-system
```
Modifie la ligne `forward` dans le bloc `.:53`, sauvegarde et quitte.

**Méthode B – Patch (si la config est standard) :**
```bash
kubectl get configmap coredns -n kube-system -o yaml | \
  sed 's/forward \. \/etc\/resolv.conf/forward . 8.8.8.8 1.1.1.1/' | \
  kubectl apply -f -
```

### 3. Redémarrer CoreDNS

```bash
kubectl rollout restart deployment coredns -n kube-system
# ou si CoreDNS est un DaemonSet :
kubectl rollout restart daemonset coredns -n kube-system
```

### 4. Tester la résolution depuis le cluster

```bash
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup bend-racing.fr
```

Tu dois voir l’IP `195.154.73.29`.

### 5. Relancer la délivrance du certificat

```bash
kubectl delete certificate bend-racing-tls -n bend-racing-web
```

Attends 1–2 minutes, puis :
```bash
kubectl get certificate -n bend-racing-web
```

---

**Note (Scaleway K8s managé)** : la ConfigMap CoreDNS peut être gérée par le contrôle plane. Si tes changements sont écrasés, contacte le support Scaleway ou prévois l’usage du challenge **DNS-01** avec l’API DNS Scaleway.
