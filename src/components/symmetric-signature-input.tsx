import { Textarea } from "@mantine/core"

interface SymmetricSignatureInputProps {
    onSecretChange: (secret: string) => void
}

export default function SymmetricSignatureInput(props: SymmetricSignatureInputProps) {
    return (
        <Textarea w="fit-content" ml="md" placeholder="Secret" onChange={(evt) => props.onSecretChange(evt.target.value)} />
    );
}