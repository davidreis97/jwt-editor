import { Flex, Text, Textarea } from "@mantine/core"

interface AsymmetricSignatureInputProps {
    onPublicKeyChange: (pubKey: string) => void
    onPrivateKeyChange: (privKey: string) => void
}

export default function AsymmetricSignatureInput(props: AsymmetricSignatureInputProps) {
    return (
        <>
            <Flex ml="md" align="end">
                <Textarea placeholder="Public Key" onChange={(evt) => props.onPublicKeyChange(evt.target.value)} />
                <Text>,</Text>
            </Flex>
            <Textarea mt="0.3rem" w="fit-content" ml="md" placeholder="Private Key" onChange={(evt) => props.onPrivateKeyChange(evt.target.value)} />
        </>
    );
}