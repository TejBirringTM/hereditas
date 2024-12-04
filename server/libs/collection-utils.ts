export const setToArray = <T>(input: Set<T> | undefined) => {
    if (input) {
        return Array.from(input);
    } else {
        return new Array<T>();
    }
};

export function hasCommonElements<T>(needle: T[], haystack: T[]): boolean {
    // Using Set for O(n) lookup time
    const haystackSet = new Set<T>(haystack);
    
    // Check if any element from needle exists in haystack
    return needle.some(element => haystackSet.has(element));
}
