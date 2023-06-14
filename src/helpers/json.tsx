export function canJsonParse(data: string) {
    if (!!!data)
        return true;

    try {
        JSON.parse(data)
        return true;
    } catch (e) {
        return false;
    }
}

export function formatJson(data: string) {
    try {
        const obj = JSON.parse(data);
        return JSON.stringify(obj, null, 2)
    } catch (e) {
        return data
    }
}

export function cleanUpJsonInput(data: string) {
    return data
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
}