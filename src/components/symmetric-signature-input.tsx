import { Textarea } from "@mantine/core"
import useMonospaceTextAreaStyles from "../helpers/use-monospace-text-area-styles";

interface SymmetricSignatureInputProps {
    onSecretChange: (secret: string) => void
    secret: string
}

export default function SymmetricSignatureInput(props: SymmetricSignatureInputProps) {
    const monospaceTextAreaStyles = useMonospaceTextAreaStyles();

    return (
        <Textarea classNames={{input: monospaceTextAreaStyles.classes.input}} value={props.secret} w="fit-content" ml="md" placeholder="Secret" onChange={(evt) => props.onSecretChange(evt.target.value)} />
    );
}