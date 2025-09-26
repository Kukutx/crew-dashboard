const FIREBASE_VERSION = '11.0.2';
const FIREBASE_SCRIPTS = [
  `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,
  `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`,
];

const isBrowser = typeof window !== 'undefined';
const hasDocument = typeof document !== 'undefined';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY ?? 'AIzaSyC1Hl5KexRX8ov7ZlDMEqE85grmdGr8zDM',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? 'crew-test-2db02.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID ?? 'crew-test-2db02',
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET ?? 'crew-test-2db02.firebasestorage.app',
  messagingSenderId:
    process.env.FIREBASE_MESSAGING_SENDER_ID ?? '417490407531',
  appId:
    process.env.FIREBASE_APP_ID ?? '1:417490407531:web:3f2186e54a5b773fb8e12e',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID ?? 'G-6T6E743TPC',
};

const requiredConfigKeys: Array<keyof typeof firebaseConfig> = [
  'apiKey',
  'authDomain',
  'projectId',
  'appId',
];

const isConfigValid = requiredConfigKeys.every((key) =>
  Boolean(firebaseConfig[key]),
);

const loadedScripts = new Set<string>();
let appPromise: Promise<any> | null = null;
let persistenceApplied = false;

const ensureBrowserEnvironment = () => {
  if (!isBrowser || !hasDocument) {
    throw new Error('Firebase SDK can only be used in a browser environment.');
  }
};

const ensureConfig = () => {
  if (!isConfigValid) {
    throw new Error('Firebase configuration is missing or incomplete.');
  }
};

const loadScript = (src: string) => {
  ensureBrowserEnvironment();

  if (loadedScripts.has(src)) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );

    if (existingScript) {
      if (
        existingScript.dataset.loaded === 'true' ||
        existingScript.getAttribute('data-loaded') === 'true'
      ) {
        loadedScripts.add(src);
        resolve();
        return;
      }

      existingScript.addEventListener(
        'load',
        () => {
          existingScript.dataset.loaded = 'true';
          existingScript.setAttribute('data-loaded', 'true');
          loadedScripts.add(src);
          resolve();
        },
        { once: true },
      );

      existingScript.addEventListener(
        'error',
        () => reject(new Error(`Failed to load Firebase SDK: ${src}`)),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.firebase = 'true';

    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      script.setAttribute('data-loaded', 'true');
      loadedScripts.add(src);
      resolve();
    });

    script.addEventListener('error', () => {
      script.remove();
      reject(new Error(`Failed to load Firebase SDK: ${src}`));
    });

    document.head.appendChild(script);
  });
};

const loadFirebaseSdk = async () => {
  ensureBrowserEnvironment();
  ensureConfig();

  await Promise.all(FIREBASE_SCRIPTS.map((src) => loadScript(src)));

  if (!window.firebase) {
    throw new Error('Firebase SDK failed to initialise.');
  }

  return window.firebase;
};

const getFirebaseApp = async () => {
  if (!appPromise) {
    appPromise = (async () => {
      const firebase = await loadFirebaseSdk();
      if (firebase.apps && firebase.apps.length > 0) {
        return firebase.app();
      }
      return firebase.initializeApp(firebaseConfig);
    })().catch((error) => {
      appPromise = null;
      throw error;
    });
  }
  return appPromise;
};

const getFirebaseAuth = async () => {
  const firebase = await loadFirebaseSdk();
  await getFirebaseApp();
  const auth = firebase.auth();

  if (!persistenceApplied) {
    try {
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    } catch (error) {
      console.warn('Failed to set Firebase auth persistence.', error);
    }
    persistenceApplied = true;
  }

  return auth;
};

export const waitForFirebaseUser = async (): Promise<any | null> => {
  if (!isBrowser || !hasDocument || !isConfigValid) {
    return null;
  }

  try {
    const auth = await getFirebaseAuth();
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user: any) => {
        unsubscribe();
        resolve(user ?? null);
      });
    });
  } catch (error) {
    console.warn('Unable to read Firebase auth state.', error);
    return null;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const auth = await getFirebaseAuth();
  return auth.signInWithEmailAndPassword(email, password);
};

export const signInWithGoogle = async () => {
  const firebase = await loadFirebaseSdk();
  const auth = await getFirebaseAuth();
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return auth.signInWithPopup(provider);
};

export const mapFirebaseUserToCurrentUser = (user: any): API.CurrentUser => {
  return {
    name: user?.displayName ?? user?.email ?? 'Crew member',
    email: user?.email ?? undefined,
    avatar: user?.photoURL ?? undefined,
    userid: user?.uid ?? undefined,
  };
};

export const hasValidFirebaseConfig = () => isConfigValid;
