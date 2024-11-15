export default function appendOrdinalSuffix(input: number): string {
    const j = input % 10;
    const k = input % 100;
    
    if (j === 1 && k !== 11) {
        return input + "st";
    }
    if (j === 2 && k !== 12) {
        return input + "nd";
    }
    if (j === 3 && k !== 13) {
        return input + "rd";
    }
    return input + "th";
}
