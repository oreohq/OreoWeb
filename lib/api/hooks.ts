"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { ApiError, apiFetch, isAbortError } from "@/lib/api/client";


interface Entry {
    data?: unknown;
    error?: ApiError;
    validating?: boolean;
    updatedAt?: number;
}

const EMPTY: Entry = Object.freeze({});
const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<ApiError | null>>();
const listeners = new Map<string, Set<() => void>>();
const writes = new Map<string, number>();

const DEDUPE_MS = 2000;


function set(key: string, next: Entry) {
    store.set(key, next);
    listeners.get(key)?.forEach((listener) => listener());
}

function toApiError(error: unknown): ApiError {
    return error instanceof ApiError ? error : new ApiError(0, "network", "Something went wrong. Please try again.");
}


export function revalidate(key: string, options: { path?: string, throwOnError?: boolean } = {}): Promise<void> {
    let request = options.path ? undefined : inflight.get(key);

    if (!request) {
        set(key, { ...(store.get(key) ?? {}), validating: true });
        const version = writes.get(key) ?? 0;

        const started: Promise<ApiError | null> = apiFetch<unknown>(options.path ?? key)
            .then(
                (data) => {
                    // A save landed while this was in flight, so its data is newer than this response
                    if ((writes.get(key) ?? 0) !== version) set(key, { ...(store.get(key) ?? {}), validating: false });
                    else set(key, { data, updatedAt: Date.now() });
                    return null;
                },
                (error) => {
                    const failure = isAbortError(error) ? null : toApiError(error);
                    set(key, { ...(store.get(key) ?? {}), error: failure ?? undefined, validating: false });
                    return failure;
                }
            )
            .finally(() => {
                if (inflight.get(key) === started) inflight.delete(key);
            });

        inflight.set(key, started);
        request = started;
    }

    return request.then((failure) => {
        if (failure && options.throwOnError) throw failure;
    });
}


export function mutate<T>(key: string, update: T | ((current: T | undefined) => T | undefined)) {
    const current = store.get(key) ?? {};
    const data =
        typeof update === "function"
            ? (update as (current: T | undefined) => T | undefined)(current.data as T | undefined)
            : update;
    writes.set(key, (writes.get(key) ?? 0) + 1);
    set(key, { ...current, data, error: undefined, updatedAt: Date.now() });
}

export function clearCache() {
    for (const key of [...store.keys()]) set(key, {});
    store.clear();
}


export interface ApiState<T> {
    data: T | undefined;
    error: ApiError | undefined;
    loading: boolean;
    validating: boolean;
    updatedAt: number;
    reload: (path?: string) => Promise<void>;
    mutate: (update: T | ((current: T | undefined) => T | undefined)) => void;
}

export function useApi<T>(key: string | null): ApiState<T> {
    const subscribe = useCallback(
        (listener: () => void) => {
            if (!key) return () => {};
            let set = listeners.get(key);
            if (!set) listeners.set(key, (set = new Set()));
            set.add(listener);
            return () => {
                set!.delete(listener);
            };
        },
        [key]
    );

    const entry = useSyncExternalStore(
        subscribe,
        () => (key ? store.get(key) ?? EMPTY : EMPTY),
        () => EMPTY
    );

    useEffect(() => {
        if (!key) return;
        const current = store.get(key);
        if (current?.updatedAt && Date.now() - current.updatedAt < DEDUPE_MS) return;
        void revalidate(key);
    }, [key]);

    const reload = useCallback(
        (path?: string) => (key ? revalidate(key, { path, throwOnError: true }) : Promise.resolve()),
        [key]
    );

    const update = useCallback(
        (value: T | ((current: T | undefined) => T | undefined)) => {
            if (key) mutate<T>(key, value);
        },
        [key]
    );

    return {
        data: entry.data as T | undefined,
        error: entry.error,
        loading: Boolean(key) && entry.data === undefined && !entry.error,
        validating: Boolean(entry.validating),
        updatedAt: entry.updatedAt ?? 0,
        reload,
        mutate: update
    };
}
