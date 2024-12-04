type Nullable<T> = T | null;

export class AdjacencyMapError extends Error {
    public override readonly name: string;
    constructor(message?: string) {
        super(message);
        this.name = "AdjacencyMapError";
    }
}

export class AdjacencyMapSingular<Key extends string, Val extends string> {
    public readonly name;
    private readonly map;
    constructor(name: string, keys: Key[]) {
        this.name = name;
        this.map = new Map(keys.map((key)=>[key, null as Nullable<Val>]));
    }
    get(key: Key) {
        if (!this.map.has(key)) {
            throw new AdjacencyMapError("Key does not exist in the adjacency map! " + `${this.name} => ${key}`);
        } else {
            return this.map.get(key) ?? null as Nullable<Val>;
        }
    }
    set(key: Key, val: Val) {
        if (!this.map.has(key)) {
            throw new AdjacencyMapError("Key does not exist in the adjacency map! " + `${this.name} => ${key}`);
        } else {
            this.map.set(key, val);
        }
    }
}

export class AdjacencyMapMultiple<Key extends string, Val extends string> {
    public readonly name;
    private readonly map;
    constructor(name: string, keys: Key[]) {
        this.name = name;
        this.map = new Map(keys.map((key)=>[key, new Set<Val>()]));
    }
    get(key: Key) {
        const set = this.map.get(key);
        if (set) {
            return [...set.values()];
        } else {
            throw new AdjacencyMapError("Key does not exist in the adjacency map! " + `${this.name} => ${key}`);
        }
    }
    set(key: Key, ...val: Val[]) {
        const set = this.map.get(key);
        if (set) {
            for (const v of val) {
                set.add(v);
            }
        } else {
            throw new AdjacencyMapError("Key does not exist in the adjacency map! " + `${this.name} => ${key}`);
        }
    }
}
