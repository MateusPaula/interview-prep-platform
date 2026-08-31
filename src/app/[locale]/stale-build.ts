const STALE_BUILD_SIGNALS = [
  "chunkloaderror",
  "loading chunk",
  "failed to load chunk",
  "dynamically imported module",
  "loading css chunk",
];

export function isStaleBuildError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const haystack = `${error.name} ${error.message}`.toLowerCase();
  return STALE_BUILD_SIGNALS.some((signal) => haystack.includes(signal));
}
