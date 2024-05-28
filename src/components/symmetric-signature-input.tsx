import { Textarea } from "@mantine/core";

interface SymmetricSignatureInputProps {
    onSecretChange: (secret: string) => void
    secret: string
}

export default function SymmetricSignatureInput(props: SymmetricSignatureInputProps) {

    return (
        <Textarea value={props.secret} w="fit-content" ml="md" placeholder="Secret" onChange={(evt) => props.onSecretChange(evt.target.value)} />
    );
}