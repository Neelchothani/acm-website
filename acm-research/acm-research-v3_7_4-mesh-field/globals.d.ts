/// <reference types="vite/client" />

declare module 'vanta/dist/vanta.globe.min';

declare module '*.md' {
  const content: string;
  export default content;
}
