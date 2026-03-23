# Schéma de l'architecture Bend Racing Web

## Vue d'ensemble

Application web **SPA (Single Page Application)** React pour Bend Racing – spécialiste 2 roues : achat, préparation moteur, réparation et performance. Déployée sur **Kubernetes (Scaleway)** avec NGINX Ingress.

---

## Infrastructure complète (Kubernetes + Ingress)

```mermaid
flowchart TB
    subgraph Internet["🌐 Internet"]
        User[Utilisateur]
    end

    subgraph Scaleway["Scaleway Cloud"]
        LB[LoadBalancer externe\nIP publique\nHTTP :80 / HTTPS :443]
    end

    subgraph K8s["Cluster Kubernetes (Scaleway)"]
        subgraph ingressNS["Namespace: ingress-nginx"]
            IngressCtrl[NGINX Ingress Controller v1.14.3]
            SvcLB[Service type: LoadBalancer]
            IngressCtrl --> SvcLB
        end

        subgraph appNS["Namespace: bend-racing-web"]
            Ingress[Ingress\npath: /\npathType: Prefix]
            Svc[Service ClusterIP :80]
            Deploy[Deployment\n1 replica]
            Pod[Pod\nnginx: rg.registry.scw.cloud/.../bend-racing:latest]
            
            Ingress --> Svc
            Svc --> Deploy
            Deploy --> Pod
        end
    end

    User --> LB
    LB --> IngressCtrl
    IngressCtrl --> Ingress
    Ingress --> Svc
    Svc --> Pod
```

---

## Flux trafic HTTP (de l'utilisateur au Pod)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant LB as LoadBalancer Scaleway
    participant IC as NGINX Ingress Controller
    participant I as Ingress bend-racing-web
    participant SVC as Service ClusterIP
    participant Pod as Pod (nginx)

    U->>LB: HTTP/HTTPS (port 80/443)
    LB->>IC: Trafic vers ingress-nginx-controller
    IC->>I: Recherche rule path /
    I->>SVC: Route vers bend-racing-web:80
    SVC->>Pod: Forward vers nginx
    Pod->>U: index.html + assets statiques
```

---

## Manifests Kubernetes (ordre d'apply)

```mermaid
flowchart LR
    M1["1. ingress-nginx-controller.yaml"]
    M2["2. namespace.yaml"]
    M3["3. cluster-issuer.yaml"]
    M4["4. deployment.yaml"]
    M5["5. service.yaml"]
    M6["6. ingress.yaml"]

    M1 --> M2 --> M3 --> M4 --> M5 --> M6
```

| Fichier | Rôle |
|---------|------|
| `ingress-nginx-controller.yaml` | NGINX Ingress Controller + Service LoadBalancer (Scaleway provisionne l'IP publique) |
| `namespace.yaml` | Namespace `bend-racing-web` |
| `cluster-issuer.yaml` | ClusterIssuer Let's Encrypt pour certificats TLS automatiques |
| `deployment.yaml` | 1 Pod nginx avec image `rg.registry.scw.cloud/mon-namespace/bend-racing:latest` |
| `service.yaml` | Service ClusterIP exposant le port 80 |
| `ingress.yaml` | Route `bend-racing.fr` / `www.bend-racing.fr` → Service bend-racing-web:80 (TLS, HTTP→HTTPS) |

---

## Pipeline Build → Deploy

```mermaid
flowchart LR
    subgraph Dev["Développement"]
        Code[frontend/]
        Dockerfile[Dockerfile]
    end

    subgraph Build["Build image"]
        Node[Node 20 Alpine\nnpm install + build]
        NginxImg[Image finale\nnginx:alpine + dist/]
        Node --> NginxImg
    end

    subgraph Registry["Registry Scaleway"]
        Reg["rg.registry.scw.cloud\nmon-namespace/bend-racing:latest"]
    end

    subgraph K8sDeploy["Déploiement K8s"]
        KApply["kubectl apply -f ."]
        K8s[Cluster Scaleway]
        KApply --> K8s
    end

    Code --> Dockerfile
    Dockerfile --> Build
    NginxImg -->|docker push| Reg
    Reg --> Deploy[deployment.yaml\nimage: ...bend-racing:latest]
    Deploy --> KApply
```

---

## Application (frontend)

```mermaid
flowchart TB
    subgraph Client["🌐 Client (Navigateur)"]
        HTML[index.html]
        HTML --> Main[main.jsx]
        Main --> App[App.jsx]
        App --> Router[BrowserRouter]
    end

    subgraph Build["⚙️ Build & Dev"]
        Vite[Vite 7]
        React[React 19]
        Tailwind[Tailwind CSS]
        Vite --> React
        Vite --> Tailwind
    end

    subgraph Deploy["🐳 Production"]
        Docker[Docker]
        Builder[Node 20 Alpine\nnpm run build]
        Nginx[Nginx Alpine\nport 80]
        Docker --> Builder
        Builder --> Nginx
    end

    Client --> Build
    Build --> Deploy
```

---

## Structure du projet

```mermaid
flowchart TB
    subgraph frontend["frontend/"]
        subgraph src["src/"]
            main[main.jsx]
            App[App.jsx]
            index[index.css]
            main --> App
            main --> index

            subgraph components["components/"]
                Layout[Layout.jsx]
            end

            subgraph pages["pages/"]
                Accueil[Accueil.jsx]
                Vehicules[Vehicules.jsx]
                Atelier[Atelier.jsx]
                Preparation[Preparation.jsx]
                Pieces[Pieces.jsx]
                RendezVous[RendezVous.jsx]
                APropos[APropos.jsx]
                Realisations[Realisations.jsx]
                Contact[Contact.jsx]
            end
        end

        subgraph config["Configuration"]
            vite[vite.config.js]
            tailwind[tailwind.config.js]
            postcss[postcss.config.js]
        end

        public["public/"]
    end

    App --> Layout
```

---

## Arborescence des routes (React Router)

```mermaid
flowchart TB
    Root["/"]
    Layout["Layout (Header + Outlet + Footer)"]

    Root --> Layout
    Layout --> Accueil["/ - Accueil"]
    Layout --> Vehicules["/vehicules - Véhicules"]
    Layout --> Atelier["/atelier - Atelier / Réparation"]
    Layout --> Preparation["/preparation - Préparation & Performance"]
    Layout --> Pieces["/pieces - Pièces détachées"]
    Layout --> RendezVous["/rendez-vous - Prendre rendez-vous"]
    Layout --> APropos["/a-propos - À propos"]
    Layout --> Realisations["/realisations - Actualités / réalisations"]
    Layout --> Contact["/contact - Contact"]
```

---

## Flux de données & rendu

```mermaid
sequenceDiagram
    participant User as Utilisateur
    participant Browser as Navigateur
    participant React as React
    participant Router as React Router
    participant Layout as Layout
    participant Page as Page (ex: Accueil)

    User->>Browser: Accès à l'URL
    Browser->>React: Charge main.jsx
    React->>Router: App avec Routes
    Router->>Layout: Route parent avec Outlet
    Layout->>Layout: Affiche Header + Footer
    Layout->>Page: Rendu du contenu via Outlet
    Page->>User: Affichage final

    Note over Page: Pas de backend API<br/>Contenu statique uniquement
```

---

## Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | React | 19.2 |
| Build | Vite | 7.3 |
| Routing | React Router DOM | 7.6 |
| Styling | Tailwind CSS | 3.4 |
| Production serveur | Nginx (Alpine) | - |
| Conteneurisation | Docker | Multi-stage |
| Langage base | JavaScript (ES modules) | - |
| **Orchestration** | **Kubernetes (Scaleway)** | - |
| **Ingress** | **NGINX Ingress Controller** | 1.14.3 |
| **Registry** | **Scaleway Registry** | rg.registry.scw.cloud |

---

## Pipeline de déploiement Docker

```mermaid
flowchart LR
    subgraph Stage1["Stage 1 : Build"]
        A1[Node 20 Alpine]
        A2[npm install]
        A3[npm run build]
        A1 --> A2 --> A3
        A3 --> dist[dist/]
    end

    subgraph Stage2["Stage 2 : Production"]
        B1[Nginx Alpine]
        B2[dist → /usr/share/nginx/html]
        B3[nginx.conf]
        B4[Port 80]
        B1 --> B2 --> B3 --> B4
    end

    Stage1 --> Stage2
```

---

## Composants Layout

```mermaid
flowchart TB
    Layout["Layout.jsx"]

    Layout --> Header["Header (fixed)"]
    Header --> Logo["Logo BEND RACING"]
    Header --> Nav["Navigation (desktop + mobile)"]
    Header --> MenuBtn["Bouton menu burger"]

    Layout --> Main["main"]
    Main --> Outlet["Outlet (contenu route)"]

    Layout --> Footer["Footer"]
    Footer --> Info["Infos société"]
    Footer --> NavFooter["Liens navigation"]
    Footer --> CTA["CTA Rendez-vous"]

    style Outlet fill:#4a9eff,color:#fff
```

---

## Points clés

### Application
- **SPA statique** : pas d’API backend, contenu entièrement côté client
- **Navigation** : React Router avec routes imbriquées sous `Layout`
- **Responsive** : menu burger pour mobile, navigation horizontale pour desktop
- **Build** : image Docker multi-stage (build Node + serveur Nginx)

### Infrastructure
- **Kubernetes Scaleway** : cluster managé, manifests versionnés sur GitHub
- **Ingress NGINX** : LoadBalancer externe Scaleway → IP publique auto-provisionnée
- **Flux** : Internet → LB → Ingress Controller → Ingress (path /) → Service → Pod nginx
- **Image** : `rg.registry.scw.cloud/mon-namespace/bend-racing:latest`
- **Déploiement** : `kubectl apply -f .` (ordre : ingress-controller → namespace → deployment → service → ingress)
