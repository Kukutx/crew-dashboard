declare module 'slash2';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module 'numeral';
declare module 'mockjs';
declare module 'react-fittext';

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false;

declare namespace NodeJS {
  interface ProcessEnv {
    FIREBASE_API_KEY?: string;
    FIREBASE_AUTH_DOMAIN?: string;
    FIREBASE_PROJECT_ID?: string;
    FIREBASE_APP_ID?: string;
  }
}

interface Window {
  firebase?: any;
}
