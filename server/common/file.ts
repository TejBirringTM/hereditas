export async function loadTextFile(filePath: string, encoding: string = "utf-8") {
    const decoder = new TextDecoder(encoding);
    const data = await Deno.readFile(filePath);
    const decodedData = decoder.decode(data);
    return decodedData;
}