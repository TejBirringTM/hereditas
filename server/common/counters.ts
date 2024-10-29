const counters = new Map<string, number>();

function* counter(key: string) {
    while (true) {
        if (counters.has(key)) {
            const count = counters.get(key) as number;
            counters.set(key, count+1);
            yield count+1;
        } else {
            counters.set(key, 1);
            yield 1;
        }
    }
} 

export const getCount = (key: string) => counter(key).next().value;
