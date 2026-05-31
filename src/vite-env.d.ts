/// <reference types="vite/client" />

interface Window {
  djApp?: {
    platform: NodeJS.Platform;
    versions: NodeJS.ProcessVersions;
  };
}
