import Constants from 'expo-constants';

function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:5000/api`;
  }

  return 'http://localhost:5000/api';
}

export function getServerBaseUrl(): string {
  return resolveApiUrl().replace(/\/api\/?$/, '');
}

export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getServerBaseUrl()}${normalized}`;
}
