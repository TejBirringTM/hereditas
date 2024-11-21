import { assert } from "@std/assert";
import { inflate, deflate, tokeniseObject, detokeniseObject } from "./tokeniser.ts";
import { faker } from "@faker-js/faker";

const newPerson = ()=>Object.freeze({
    firstName: faker.person.fullName(),
    gender: faker.person.gender(),
    jobTitle: faker.person.jobTitle(),
});

Deno.test("Compress and decompress string", async ()=>{
    const person = newPerson();
    const personAsString = JSON.stringify(person);
    const tokenised = await deflate(personAsString);
    const untokenised = await inflate(tokenised);
    assert(personAsString === untokenised);
});

Deno.test("Compress and decompress object", async ()=>{
    const person = newPerson();
    const tokenisedObject = await tokeniseObject(person);
    const untokenisedObject = await detokeniseObject(tokenisedObject);
    assert(JSON.stringify(person) === JSON.stringify(untokenisedObject));
})