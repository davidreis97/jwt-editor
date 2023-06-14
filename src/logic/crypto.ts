import { JWTHeaderParameters, JWTPayload, KeyLike, SignJWT, importJWK, importPKCS8, importSPKI, importX509, jwtVerify } from "jose"

async function parseKey(key: string, alg: string) : Promise<KeyLike | Uint8Array> {
    if (alg == "HS256" || alg == "HS384" || alg == "HS512"){
        return new TextEncoder().encode(key)
    }

    try {
        return await importPKCS8(key, alg)
    } catch (e) { /* Not in PCKS8 format. */ }

    try {
        return await importJWK(JSON.parse(key), alg)
    } catch (e) { /* Not in JWK format. */ }

    try {
        return await importSPKI(key, alg)
    } catch (e) { /* Not in SPKI format. */ }

    try {
        return await importX509(key, alg)
    } catch (e) { /* Not in X.509 format. */ }

    throw "Could not parse key."
}

export async function isValidAsymmetricKey(key: string, algorithm: string) {
    try {
        await parseKey(key, algorithm)
        return true;
    } catch(e) {
        return false;
    }
}

export async function signJWT(header: JWTHeaderParameters, payload: JWTPayload, privateKey: string) {
    return await new SignJWT(payload)
            .setProtectedHeader(header)
            .sign(await parseKey(privateKey, header.alg))
}

export async function verifyJWT(jwt: string, publicKey: string, alg: string) {
    return await jwtVerify(jwt, await parseKey(publicKey, alg), {
        algorithms: [alg]
    })
}