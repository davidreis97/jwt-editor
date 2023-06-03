import { Textarea } from "@mantine/core"

interface SymmetricSignatureInputProps {
    onPublicKeyChange: (pubKey: string) => void
    onPrivateKeyChange: (privKey: string) => void
}

export default function SymmetricSignatureInput(props: SymmetricSignatureInputProps) {
    return (
        <Textarea w="fit-content" ml="md" placeholder="Secret" onChange={(evt) => { props.onPublicKeyChange(evt.target.value); props.onPrivateKeyChange(evt.target.value)}} />
    );
}