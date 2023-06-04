import { Flex, Text, Textarea } from "@mantine/core"
import KeyPair from "../helpers/key-pair";

interface AsymmetricSignatureInputProps {
    onPublicKeyChange: (pubKey: string) => void
    onPrivateKeyChange: (privKey: string) => void
    keyPair: KeyPair
}

export default function AsymmetricSignatureInput(props: AsymmetricSignatureInputProps) {
    return (
        <>
            <Flex ml="md" align="end">
                <Textarea value={props.keyPair.publicKey} placeholder="Public Key" onChange={(evt) => props.onPublicKeyChange(evt.target.value)} />
                <Text>,</Text>
            </Flex>
            <Textarea value={props.keyPair.privateKey} mt="0.3rem" w="fit-content" ml="md" placeholder="Private Key" onChange={(evt) => props.onPrivateKeyChange(evt.target.value)} />
        </>
    );
}