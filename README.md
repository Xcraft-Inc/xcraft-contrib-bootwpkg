# 📘 xcraft-contrib-bootwpkg

## Aperçu

Le module `xcraft-contrib-bootwpkg` est un utilitaire spécialisé du framework Xcraft qui automatise le téléchargement, la compilation et l'installation de WPKG (Windows Package Manager) depuis les sources. Il fournit une solution cross-platform pour intégrer WPKG dans l'écosystème Xcraft, en gérant automatiquement les spécificités de chaque système d'exploitation et en utilisant CMake pour la compilation.

## Sommaire

- [Structure du module](#structure-du-module)
- [Fonctionnement global](#fonctionnement-global)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Interactions avec d'autres modules](#interactions-avec-dautres-modules)
- [Configuration avancée](#configuration-avancée)
- [Détails des sources](#détails-des-sources)

## Structure du module

Le module est organisé autour d'un fichier principal `wpkg.js` qui expose une commande `build` sur le bus Xcraft. Il utilise plusieurs modules utilitaires de l'écosystème Xcraft pour gérer le téléchargement, l'extraction, la compilation CMake et l'installation de WPKG.

**Composants principaux :**

- **Gestionnaire de build** : Orchestration complète du processus de compilation WPKG
- **Adaptateurs cross-platform** : Gestion des spécificités Windows/Unix avec CMake
- **Système de compilation** : Utilisation de CMake et make pour la construction
- **Configuration dynamique** : Paramétrage via `xcraft-core-etc`

## Fonctionnement global

Le module suit un pipeline de build en plusieurs étapes orchestrées par `async.auto` :

1. **Téléchargement** (`taskHttp`) : Récupération de l'archive WPKG depuis l'URL configurée avec suivi de progression
2. **Extraction** (`taskExtract`) : Décompression de l'archive tar.gz avec suivi de progression et gestion des noms de fichiers longs
3. **Gestion MSYS** (`taskMSYS`) : Sur Windows, suppression temporaire des chemins MSYS pour éviter les conflits avec MinGW
4. **Configuration CMake** (`taskCMake`) : Configuration du projet avec CMake et génération des Makefiles
5. **Compilation** (`taskMake`) : Construction et installation finale avec compilation parallèle

Le module s'adapte automatiquement à l'environnement :

- **Windows** : Utilise MinGW Makefiles et gère les conflits avec MSYS
- **macOS** : Configure les chemins de bibliothèques avec `@executable_path/../lib`
- **Linux** : Configure les chemins de bibliothèques avec `$ORIGIN/../lib`
- **Optimisations** : Compilation en mode Release avec compilation parallèle

## Exemples d'utilisation

### Construction de WPKG via le bus Xcraft

```javascript
// Déclenchement de la construction de WPKG
this.quest.cmd('wpkg.build', {id: 'unique-build-id'});

// Écoute de la fin de construction
resp.events.subscribe('wpkg.build.unique-build-id.finished', (msg) => {
  console.log('WPKG build completed');
});
```

### Utilisation dans un processus de build automatisé

```javascript
// Dans un script de build ou un autre module
const buildWpkg = async () => {
  return new Promise((resolve, reject) => {
    const buildId = 'wpkg-build-' + Date.now();

    // Écouter la fin du build
    resp.events.subscribe(`wpkg.build.${buildId}.finished`, () => {
      resolve();
    });

    // Lancer le build
    this.quest.cmd('wpkg.build', {id: buildId});
  });
};
```

## Interactions avec d'autres modules

Le module s'intègre étroitement avec l'écosystème Xcraft :

- **[xcraft-contrib-bootcmake]** : Utilise les utilitaires cross-platform pour la gestion de MSYS sur Windows
- **[xcraft-core-etc]** : Gestion de la configuration (version WPKG, URLs, répertoires)
- **[xcraft-core-http]** : Téléchargement des archives sources avec suivi de progression
- **[xcraft-core-extract]** : Extraction des archives tar.gz avec suivi de progression et filtrage de fichiers
- **[xcraft-core-process]** : Exécution des processus de compilation avec parser cmake
- **[xcraft-core-platform]** : Détection et adaptation cross-platform
- **[xcraft-core-env]** : Gestion des variables d'environnement et des devroot
- **[xcraft-core-fs]** : Opérations sur le système de fichiers (copie, suppression, création)

## Configuration avancée

| Option    | Description                  | Type   | Valeur par défaut                                                                              |
| --------- | ---------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| `name`    | Nom du package WPKG          | string | `"wpkg"`                                                                                       |
| `version` | Version de WPKG à compiler   | string | `"f2518193ec93b98eb67ecddc11e262f41e76e87f"`                                                   |
| `src`     | URI source de l'archive WPKG | string | `"https://github.com/Xcraft-Inc/wpkg/archive/f2518193ec93b98eb67ecddc11e262f41e76e87f.tar.gz"` |
| `out`     | Répertoire d'installation    | string | `"./usr"`                                                                                      |

## Détails des sources

### `wpkg.js`

Le fichier principal expose la fonctionnalité de build de WPKG avec gestion complète du processus de compilation.

#### Commandes Xcraft

- **`build(msg, resp)`** — Lance le processus complet de téléchargement, compilation et installation de WPKG. Gère automatiquement toutes les étapes du pipeline de build avec gestion d'erreurs et restauration du PATH. Émet l'événement `wpkg.build.${msg.id}.finished` à la fin du processus.

#### Fonctions internes de build

Le module utilise plusieurs fonctions internes pour orchestrer le build :

- **`cmakeRun(srcDir, resp, callback)`** : Configure le projet WPKG avec CMake. Crée un répertoire de build séparé (`BUILD_WPKG`), configure les options de compilation en mode Release, et adapte les paramètres selon l'OS :

  - **Windows** : Utilise le générateur "MinGW Makefiles"
  - **macOS** : Configure les chemins de bibliothèques avec `-rpath @executable_path/../lib`
  - **Linux** : Configure les chemins de bibliothèques avec `-rpath $ORIGIN/../lib`

- **`makeRun(makeDir, resp, callback)`** : Exécution de la compilation avec make. Utilise l'outil make approprié selon l'OS (mingw32-make sur Windows, make sur Unix), compile avec le nombre optimal de jobs parallèles basé sur `os.cpus().length`, et copie les fichiers compilés vers le répertoire de sortie configuré.

Le processus de build utilise des optimisations spécifiques :

- **Compilation parallèle** : Utilise `-j` avec le nombre de CPU disponibles pour optimiser les temps de build
- **Mode Release** : Configuration CMake en mode Release pour des performances optimales
- **Gestion des chemins de bibliothèques** : Configuration automatique des RPATH selon l'OS pour l'exécution autonome
- **Gestion des environnements** : Mise à jour automatique des devroot pour l'environnement bootstrap
- **Filtrage d'extraction** : Exclusion automatique des fichiers avec des noms très longs qui posent problème sur certains systèmes

#### Gestion des erreurs et nettoyage

Le module inclut une gestion robuste des erreurs :

- **Restauration du PATH** : Sur Windows, restauration automatique des chemins MSYS supprimés temporairement
- **Gestion des répertoires temporaires** : Nettoyage et création des répertoires de build
- **Logging détaillé** : Utilisation du système de logging Xcraft avec suivi de progression
- **Événements de fin** : Émission systématique d'événements de fin de build pour la synchronisation

[xcraft-contrib-bootcmake]: https://github.com/Xcraft-Inc/xcraft-contrib-bootcmake
[xcraft-core-etc]: https://github.com/Xcraft-Inc/xcraft-core-etc
[xcraft-core-http]: https://github.com/Xcraft-Inc/xcraft-core-http
[xcraft-core-extract]: https://github.com/Xcraft-Inc/xcraft-core-extract
[xcraft-core-process]: https://github.com/Xcraft-Inc/xcraft-core-process
[xcraft-core-platform]: https://github.com/Xcraft-Inc/xcraft-core-platform
[xcraft-core-env]: https://github.com/Xcraft-Inc/xcraft-core-env
[xcraft-core-fs]: https://github.com/Xcraft-Inc/xcraft-core-fs

---

_Documentation mise à jour automatiquement pour le module xcraft-contrib-bootwpkg_