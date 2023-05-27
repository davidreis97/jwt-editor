import { Box, Divider, Flex, Paper, Text, Textarea } from "@mantine/core"
import { IconCircleCheck, IconCircleX, IconHelpCircle, IconInfoCircle } from "@tabler/icons-react"
import SignatureStatus, { Status } from "../helpers/signature-status"

interface KeyPairSignatureProps {
    onPublicKeyChange: (pubKey: string) => void
    onPrivateKeyChange: (privKey: string) => void
    signatureStatus: SignatureStatus
}

export default function KeyPairSignature(props: KeyPairSignatureProps) {
    return (
      <Paper h="fit-content" sx={{overflow:"hidden"}} withBorder>
        <Box m="sm">
            <Text>RSASHA256(</Text>
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