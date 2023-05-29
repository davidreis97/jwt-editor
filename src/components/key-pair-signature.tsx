import { Box, Divider, Flex, Paper, Select, Text, Textarea } from "@mantine/core"
import { IconCircleCheck, IconCircleX, IconHelpCircle, IconInfoCircle } from "@tabler/icons-react"
import SignatureStatus, { Status } from "../helpers/signature-status"
import { useState } from "react"

interface KeyPairSignatureProps {
    onPublicKeyChange: (pubKey: string) => void
    onPrivateKeyChange: (privKey: string) => void
    onAlgorithmChange: (algorithm: string) => void
    signatureStatus: SignatureStatus
}

export default function KeyPairSignature(props: KeyPairSignatureProps) {
    const [algorithm, setAlgorithm] = useState<string>("RS256")

    return (
      <Paper h="fit-content" sx={{overflow:"hidden"}} withBorder>
        <Box m="sm">
            <Flex align="center" gap="0.2rem" mb="0.3rem">
                <Select w="10rem" data={[
                    { value: "RS256", label:"RS256", group: "RSA + SHA" },
                    { value: "RS384", label:"RS384", group: "RSA + SHA" },
                    { value: "RS512", label:"RS512", group: "RSA + SHA" },
                    { value: "ES256", label:"ES256", group: "ECDSA + SHA" },
                    { value: "ES384", label:"ES384", group: "ECDSA + SHA" },
                    //{ value: "ES512", label:"ES512", group: "ECDSA + SHA" },
                    { value: "PS256", label:"PS256", group: "RSA-PSS + SHA" },
                    { value: "PS384", label:"PS384", group: "RSA-PSS + SHA" },
                    { value: "PS512", label:"PS512", group: "RSA-PSS + SHA" },
                    { value: "EdDSA", label:"EdDSA", group: "EdDSA" },
                    ]}
                    value={algorithm}
                    onChange={(alg: string) => {setAlgorithm(alg); props.onAlgorithmChange(alg)}}
                    />
                <Text>(</Text>
            </Flex>
            <Text ml="md">base64UrlEncode(header) + "." +</Text>
            <Text ml="md">base64UrlEncode(payload),</Text>
            <Flex ml="md" align="end">
                <Textarea placeholder="Public Key" onChange={(evt) => props.onPublicKeyChange(evt.target.value)}/>
                <Text>,</Text>
            </Flex>
            <Textarea mt="0.3rem" w="fit-content" ml="md" placeholder="Private Key" onChange={(evt) => props.onPrivateKeyChange(evt.target.value)}/>
            <Text>)</Text>
        </Box>
        <Divider/>
        <Flex bg={statusToColor(props.signatureStatus.status)} align="center" p="0.3rem" pl="sm">
            {statusToIcon(props.signatureStatus.status)}
            <Text ml="0.4rem">{props.signatureStatus.message}</Text>
        </Flex>
      </Paper>
    );
}

function statusToColor(status: Status) {
    if(status == "info"){
        return "dark.9"
    }
    
    if(status == "invalid") { 
        return "red.9"
    }

    if(status == "valid") {
        return "green.9 "
    }
}

function statusToIcon(status: Status){
    if(status == "info"){
        return <IconInfoCircle/>
    }
    
    if(status == "invalid") { 
        return <IconCircleX/>
    }

    if(status == "valid") {
        return <IconCircleCheck/>
    }

    return <IconHelpCircle/>
}