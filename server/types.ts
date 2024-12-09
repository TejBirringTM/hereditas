export type Nullable<T> = T | null;
export type Optional<T> = T | undefined | null;
export type Resolved<O extends object> = { [K in keyof O]: O[K] };
