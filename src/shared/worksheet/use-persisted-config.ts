import type { Dispatch, SetStateAction } from 'react';

import { useRef, useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// usePersistedConfig
//
// Drop-in replacement for `useState` whose value is persisted to
// `localStorage` under the key `diyyy:<key>`.
//
// Versioning: the persisted payload carries the schema `version`. If the
// caller bumps the version (because the shape of `T` changed in an
// incompatible way), older payloads are discarded and `defaultValue` is
// returned instead.
//
// Failure modes (private mode, quota exceeded, disabled storage, JSON
// parse errors, SSR) all silently fall back to in-memory state.
// ----------------------------------------------------------------------

const STORAGE_PREFIX = 'diyyy:';

interface StoredPayload<T> {
  v: number;
  d: T;
}

function readStorage<T>(key: string, version: number): T | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredPayload<T> | null;
    if (!parsed || parsed.v !== version) return undefined;
    return parsed.d;
  } catch {
    return undefined;
  }
}

function writeStorage<T>(key: string, version: number, data: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_PREFIX + key,
      JSON.stringify({ v: version, d: data } satisfies StoredPayload<T>)
    );
  } catch {
    // ignore: private mode, quota exceeded, etc.
  }
}

export function usePersistedConfig<T>(
  key: string,
  defaultValue: T,
  version = 1,
  options?: { onRestore?: () => void; forceInitial?: boolean }
): [T, Dispatch<SetStateAction<T>>] {
  const versionRef = useRef(version);
  const keyRef = useRef(key);
  const onRestoreRef = useRef(options?.onRestore);
  onRestoreRef.current = options?.onRestore;

  const didRestore = useRef(false);

  const [value, setValue] = useState<T>(() => {
    if (options?.forceInitial) {
      writeStorage(key, version, defaultValue);
      return defaultValue;
    }
    const stored = readStorage<T>(key, version);
    if (stored !== undefined) {
      didRestore.current = true;
      return stored;
    }
    return defaultValue;
  });

  useEffect(() => {
    if (didRestore.current) {
      didRestore.current = false;
      onRestoreRef.current?.();
    }
  }, []);

  useEffect(() => {
    writeStorage(keyRef.current, versionRef.current, value);
  }, [value]);

  return [value, setValue];
}
