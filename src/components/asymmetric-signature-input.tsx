import { Flex, Text, Textarea } from "@mantine/core"
import KeyPair from "../helpers/key-pair";
import { isValidAsymmetricKey } from "../logic/crypto";
import { useEffect, useState } from "react";
import useMonospaceTextAreaStyles from "../helpers/use-monospace-text-area-styles";

interface AsymmetricSignatureInputProps {
    onPublicKeyChange: (pubKey: string) => void
    onPrivateKeyChange: (privKey: string) => void
    keyPair: KeyPair,
    algorithm: string,
}

function validateKeyField(key: string, setIsValid: (valid: boolean) => void, algorithm: string) {
    useEffect(() => {
        async function parseKey() {            
            setIsValid(await isValidAsymmetricKey(key, algorithm))
        }
        
        if (!!!key)
            setIsValid(true);
        else 
            parseKey()
    }, [key])
}

export default function AsymmetricSignatureInput(props: AsymmetricSignatureInputProps) {
    const [validPublicKey, setValidPublicKey] = useState<boolean>(true);
    const [validPrivateKey, setValidPrivateKey] = useState<boolean>(true);

    const monospaceTextAreaStyles = useMonospaceTextAreaStyles();

    validateKeyField(props.keyPair.publicKey, setValidPublicKey, props.algorithm)
    validateKeyField(props.keyPair.privateKey, setValidPrivateKey, props.algorithm)

    return (
        <>
            <Flex ml="md" align="end">
                <Textarea classNames={{input: monospaceTextAreaStyles.classes.input}} error={!validPublicKey} value={props.keyPair.publicKey} placeholder="Public Key" onChange={(evt) => props.onPublicKeyChange(evt.target.value)} />
                <Text>,</Text>
            </Flex>
            <Textarea classNames={{input: monospaceTextAreaStyles.classes.input}} error={!validPrivateKey} value={props.keyPair.privateKey} mt="0.3rem" w="fit-content" ml="md" placeholder="Private Key" onChange={(evt) => props.onPrivateKeyChange(evt.target.value)} />
        </>
    );
}