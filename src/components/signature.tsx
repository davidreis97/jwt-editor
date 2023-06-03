import { Box, Divider, Flex, Paper, Text } from "@mantine/core"
import { IconCircleCheck, IconCircleX, IconHelpCircle, IconInfoCircle } from "@tabler/icons-react"
import SignatureStatus, { Status } from "../helpers/signature-status"
import { useState } from "react"
import isSymmetric from "../helpers/is-symmetric"
import SymmetricSignatureInput from "./symmetric-signature-input"
import AsymmetricSignatureInput from "./asymmetric-signature-input"

interface SignatureProps {
    onPublicKeyChange: (pubKey: string) => void
    onPrivateKeyChange: (privKey: string) => void
    onAlgorithmChange: (algorithm: string) => void
    algorithm: string
    signatureStatus: SignatureStatus
}

export default function Signature(props: SignatureProps) {
    return (
      <Paper h="fit-content" sx={{overflow:"hidden"}} withBorder>
        <Box m="sm">
            <Flex align="center" gap="0.2rem" mb="0.3rem">
                <select
                    value={props.algorithm}
                    onChange={(evt) => {props.onAlgorithmChange(evt.target.value)}}>
                    <optgroup label="HMAC + SHA">  
                        <option value="HS256">HS256</option>
                        <option value="HS384">HS384</option>
                        <option value="HS512">HS512</option>
                    </optgroup>
                    <optgroup label="RSA + SHA">
                        <option value="RS256">RS256</option>
                        <option value="RS384">RS384</option>
                        <option value="RS512">RS512</option>
                    </optgroup>
                    <optgroup label="ECDSA + SHA">
                        <option value="ES256">ES256</option>
                        <option value="ES384">ES384</option>
                        <option value="ES512">ES512</option>
                    </optgroup>
                    <optgroup label="RSA-PSS + SHA">
                        <option value="PS256">PS256</option>
                        <option value="PS384">PS384</option>
                        <option value="PS512">PS512</option>
                    </optgroup>
                </select>
                <Text>(</Text>
            </Flex>
            <Text ml="md">base64UrlEncode(header) + "." +</Text>
            <Text ml="md">base64UrlEncode(payload),</Text>
            {
                isSymmetric(props.algorithm) ? 
                <SymmetricSignatureInput onPrivateKeyChange={props.onPrivateKeyChange} onPublicKeyChange={props.onPublicKeyChange}/> :  
                <AsymmetricSignatureInput onPrivateKeyChange={props.onPrivateKeyChange} onPublicKeyChange={props.onPublicKeyChange}/>
            }
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