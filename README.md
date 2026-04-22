# Serveur MCP watsonx.data Retrieval

Ce serveur MCP (Model Context Protocol) permet d'interroger directement les bibliothèques de documents IBM watsonx.data depuis votre assistant IA (BOB ou Claude Desktop). Il utilise le service de recherche et récupération de watsonx.data pour effectuer des recherches sémantiques dans vos documents indexés.

## ⚡ Démarrage rapide

```bash
# 1. Cloner et installer
git clone https://github.com/jmlegon/watsonx-retrieval-mcp.git
cd watsonx-retrieval-mcp
npm install && npm run build

# 2. Noter le chemin absolu
pwd

# 3. Obtenir votre clé API IBM Cloud sur https://cloud.ibm.com

# 4. Configurer ~/.bob/settings/mcp_settings.json (voir section Configuration)

# 5. Redémarrer BOB et tester !
```

**📖 Besoin d'aide ?** Consultez les sections détaillées ci-dessous. 👇

## 🎯 Cas d'usage

- **Recherche documentaire intelligente** : Interroger des bases de connaissances d'entreprise
- **RAG (Retrieval Augmented Generation)** : Enrichir les réponses de l'IA avec vos propres documents
- **Analyse de documents** : Extraire des informations spécifiques de grandes collections de documents
- **Support technique** : Accéder rapidement à la documentation technique ou aux manuels

## 📋 Prérequis

- **Node.js** version 18 ou supérieure
- **npm** (inclus avec Node.js)
- Un compte **IBM Cloud** avec accès à watsonx.data
- Une **bibliothèque de documents** configurée dans watsonx.data

## 🚀 Installation rapide

### Étape 1 : Cloner et compiler

```bash
# Cloner le dépôt
git clone https://github.com/jmlegon/watsonx-retrieval-mcp.git
cd watsonx-retrieval-mcp

# Installer les dépendances
npm install

# Compiler le projet
npm run build

# Noter le chemin absolu (vous en aurez besoin)
pwd
# Exemple de résultat : /Users/votrenom/projets/watsonx-retrieval-mcp
```

### Étape 2 : Obtenir vos informations

Vous aurez besoin de :

1. **Votre clé API IBM Cloud** (à créer sur https://cloud.ibm.com → Manage → Access (IAM) → API keys)
2. **Document Library ID** : Demandez-le au créateur du projet
3. **Container ID (Project ID)** : Demandez-le au créateur du projet

### Étape 3 : Configurer BOB

Éditez `~/.bob/settings/mcp_settings.json` et ajoutez :

```json
{
  "mcpServers": {
    "watsonx-retrieval-service": {
      "command": "node",
      "args": [
        "/VOTRE/CHEMIN/VERS/watsonx-retrieval-mcp/build/index.js"
      ],
      "env": {
        "IBM_WATSONX_API_KEY": "VOTRE_CLE_API_PERSONNELLE",
        "WATSONX_DOCUMENT_LIBRARY_ID": "ID_FOURNI_PAR_CREATEUR",
        "WATSONX_CONTAINER_ID": "ID_FOURNI_PAR_CREATEUR"
      },
      "alwaysAllow": [
        "search_watsonx_retrieval"
      ]
    }
  }
}
```

**⚠️ Remplacez** :
- `/VOTRE/CHEMIN/VERS/` par le chemin obtenu avec `pwd` à l'étape 1
- `VOTRE_CLE_API_PERSONNELLE` par votre clé API IBM Cloud
- Les IDs par ceux fournis par le créateur du projet

### Étape 4 : Redémarrer et tester

1. Redémarrez BOB complètement
2. Testez avec : `Recherche dans mes documents watsonx les informations sur les pipelines`

✅ Si tout fonctionne, BOB utilisera automatiquement le serveur MCP !

## ⚙️ Configuration

### Informations requises

Vous devez obtenir les informations suivantes depuis votre instance watsonx.data :

1. **IBM_WATSONX_API_KEY** : Votre clé API IBM Cloud
   - Obtenir : IBM Cloud → Manage → Access (IAM) → API keys

2. **WATSONX_DOCUMENT_LIBRARY_ID** : L'ID de votre bibliothèque de documents
   - Obtenir : Dans watsonx.data, ouvrez votre bibliothèque de documents

3. **WATSONX_CONTAINER_ID** : L'ID de votre projet watsonx.data
   - Obtenir : Dans watsonx.data, ouvrez votre projet

### Configuration pour BOB

Éditez `~/.bob/settings/mcp_settings.json` :

```json
{
  "mcpServers": {
    "watsonx-retrieval-service": {
      "command": "node",
      "args": [
        "/CHEMIN/ABSOLU/VERS/watsonx-retrieval-mcp/build/index.js"
      ],
      "env": {
        "IBM_WATSONX_API_KEY": "VOTRE_CLE_API",
        "WATSONX_DOCUMENT_LIBRARY_ID": "VOTRE_LIBRARY_ID",
        "WATSONX_CONTAINER_ID": "VOTRE_PROJECT_ID"
      },
      "alwaysAllow": [
        "search_watsonx_retrieval"
      ]
    }
  }
}
```

### Configuration pour Claude Desktop

Éditez `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) :

```json
{
  "mcpServers": {
    "watsonx-retrieval-service": {
      "command": "node",
      "args": [
        "/CHEMIN/ABSOLU/VERS/watsonx-retrieval-mcp/build/index.js"
      ],
      "env": {
        "IBM_WATSONX_API_KEY": "VOTRE_CLE_API",
        "WATSONX_DOCUMENT_LIBRARY_ID": "VOTRE_LIBRARY_ID",
        "WATSONX_CONTAINER_ID": "VOTRE_PROJECT_ID"
      }
    }
  }
}
```

**⚠️ Important** : Remplacez `/CHEMIN/ABSOLU/VERS/` par le chemin réel vers votre installation.

## 🔧 Outil disponible

### search_watsonx_retrieval

Effectue une recherche dans le service de retrieval watsonx.data.

**Paramètre obligatoire :**
- `query` (string) : La requête de recherche à exécuter

**Paramètres optionnels :**
- `document_library_id` (string) : Surcharge l'ID de bibliothèque par défaut
- `container_id` (string) : Surcharge l'ID de conteneur par défaut
- `container_type` (string) : Type de conteneur (défaut: "project")
- `inference_model_id` (string) : Modèle d'inférence (défaut: "meta-llama/llama-3-3-70b-instruct")
- `vector_limit` (number) : Limite de résultats vectoriels (défaut: 10)
- `enable_sql_search` (boolean) : Activer recherche SQL (défaut: true)
- `enable_vector_search` (boolean) : Activer recherche vectorielle (défaut: true)
- `enable_inference` (boolean) : Activer l'inférence (défaut: true)
- `provide_suggested_template` (boolean) : Fournir un template suggéré (défaut: false)

**Exemple d'utilisation simple :**

Dans votre conversation avec BOB ou Claude :

```
Recherche dans mes documents watsonx les informations sur les pipelines de streaming
```

L'assistant utilisera automatiquement le serveur MCP pour interroger votre bibliothèque.

## 🔐 Authentification

Le serveur gère automatiquement l'authentification avec l'API IBM Cloud :
1. Obtient un token d'accès via l'API IAM d'IBM Cloud
2. Met en cache le token jusqu'à son expiration
3. Utilise le token pour authentifier les requêtes vers l'API de retrieval

## 🛠️ Développement

### Structure du projet

```
watsonx-retrieval-mcp/
├── src/
│   └── index.ts          # Code source TypeScript du serveur
├── build/                # Code compilé (généré automatiquement)
│   └── index.js
├── package.json          # Dépendances et scripts npm
├── tsconfig.json         # Configuration TypeScript
├── .gitignore           # Fichiers à ignorer dans Git
└── README.md            # Ce fichier
```

### Modifier le serveur

1. Modifier le code dans `src/index.ts`
2. Recompiler : `npm run build`
3. Redémarrer BOB ou Claude Desktop pour recharger le serveur MCP

### Scripts disponibles

```bash
# Compiler le projet
npm run build

# Installer et compiler (exécuté automatiquement après npm install)
npm run prepare
```

## 📚 Dépendances

- `@modelcontextprotocol/sdk` : SDK pour créer des serveurs MCP
- `axios` : Client HTTP pour les appels API
- `zod` : Validation des schémas de données
- `typescript` : Compilateur TypeScript

## 🐛 Dépannage

### Le serveur ne démarre pas

1. Vérifiez que Node.js est installé : `node --version`
2. Vérifiez que le projet a été compilé : le dossier `build/` doit exister
3. Vérifiez le chemin absolu dans la configuration

### Erreur d'authentification

1. Vérifiez que votre `IBM_WATSONX_API_KEY` est valide
2. Vérifiez que la clé API a les permissions nécessaires sur watsonx.data

### Aucun résultat de recherche

1. Vérifiez que le `WATSONX_DOCUMENT_LIBRARY_ID` est correct
2. Vérifiez que votre bibliothèque contient des documents indexés
3. Vérifiez que le `WATSONX_CONTAINER_ID` est correct

## 📊 Guide de présentation

Pour une présentation complète avec cas d'usage et exemples concrets, consultez le PowerPoint :
**[`watsonx-mcp-deck.pptx`](watsonx-mcp-deck.pptx)**

Ce guide récapitulatif contient :
- Vue d'ensemble du serveur MCP
- Cas d'usage pratiques avec exemples
- Architecture et fonctionnement
- Démonstration pas à pas
- Questions fréquentes

Idéal pour présenter le projet à votre équipe ou pour une formation ! 🎯

## 🤝 Contribution

Pour contribuer à ce projet :

1. Forkez le dépôt
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajout de ma fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/ma-fonctionnalite`)
5. Créez une Pull Request

## 📄 Licence

ISC

## 🔗 Ressources

- [Documentation IBM watsonx.data](https://www.ibm.com/docs/en/watsonx/watsonxdata)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Documentation BOB](https://docs.bob.build/)

---

**Version** : 1.0.0  
**Dernière mise à jour** : Avril 2026