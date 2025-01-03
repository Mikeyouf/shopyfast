const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('Cette application web est servie en cache-first par un service worker.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }

  // Écouteur pour détecter les messages du service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
      alert("Une mise à jour est disponible ! Veuillez actualiser la page.");
      window.location.reload(); // recharge la page pour la mise à jour
    }
  });
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('Nouveau contenu disponible; veuillez actualiser.');

              // Notifie l'utilisateur et propose de recharger
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }

              // Recharge automatiquement pour mettre à jour
              window.location.reload();
            } else {
              console.log('Contenu mis en cache pour une utilisation hors ligne.');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error("Erreur lors de l'enregistrement du service worker:", error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
      headers: {
        'Service-Worker': 'script'
      },
    })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log("Pas de connexion Internet trouvée. L'application fonctionne en mode hors ligne.");
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Fonction pour vérifier les permissions de la caméra
export function checkCameraPermissions() {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({
        video: true
      })
      .then((stream) => {
        console.log('Accès à la caméra déjà accordé.');
        stream.getTracks().forEach(track => track.stop());
      })
      .catch((err) => {
        if (err.name === 'NotAllowedError') {
          console.log("Permission d'accès à la caméra refusée.");
          alert("L'application nécessite l'accès à la caméra pour fonctionner.");
        } else {
          console.error("Erreur lors de l'accès à la caméra :", err);
        }
      });
  } else {
    console.error("Les MediaDevices ne sont pas supportés par ce navigateur.");
    alert("Votre navigateur ne prend pas en charge l'accès à la caméra.");
  }
}