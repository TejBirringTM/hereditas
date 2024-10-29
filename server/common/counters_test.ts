import { assert } from "@std/assert";
import { getCount } from "./counters.ts";

Deno.test(function testGetCountWithDifferentKeys() {
    const assertErrorMessage = (key: string, expectedValue: number, actualValue?: unknown) => `expected value ${expectedValue} at key '${key}', received value: ${actualValue}'`;

    function testKey(key: string, expectValue: number) {
        const val = getCount(key);
        assert(val === expectValue, assertErrorMessage(key, expectValue, val));
    }

    testKey("aaa", 1);
    testKey("aaa", 2);
    
    testKey("bbb", 1);
    testKey("bbb", 2);

    testKey("aaa", 3);
});
