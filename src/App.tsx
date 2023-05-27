import { Flex, Grid, MantineProvider, Textarea } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri'
import { useState } from 'react';
import KeyPairSignature from './components/key-pair-signature';
import { decodeBase64, encodeBase64 } from './helpers/base64';
import SignatureStatus from './helpers/signature-status';

export default function App() {
  const [encoded, setEncoded] = useState<string>("")
  const [decodedHeader, setDecodedHeader] = useState<string>("")
  const [decodedPayload, setDecodedPayload] = useState<string>("")
  const [signature, setSignature] = useState<string>("")
  const [publicKey, setPublicKey] = useState<string>("")
  const [privateKey, setPrivateKey] = useState<string>("")
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>({
    message:"Insert a public key to check signature.",
    status: "info"
  })

  async function userChangeEncoded(newEncoded: string){
    setEncoded(newEncoded)

    const [newEncodedHeader, newEncodedPayload, signature] = newEncoded.split(".")

    setDecodedHeader(await decodeBase64(newEncodedHeader ?? ""))
    setDecodedPayload(await decodeBase64(newEncodedPayload ?? ""))
    setSignature(signature ?? "")
  }

  async function verifySignature(decodedHeader: string, decodedPayload: string, signature: string, publicKey: string) {
    const signatureIsValid = await invoke('signature_is_valid', {header: decodedHeader, payload: decodedPayload, signature, publicKey});

    if (!!!publicKey) {
      setSignatureStatus({
        message:"Insert a public key to check signature.",
        status: "info"
      })
      return
    }

    if (signatureIsValid) {
      setSignatureStatus({
        message: "Signature is valid.",
        status: "valid"
      })
    } else {
      setSignatureStatus({
        message: "Signature is invalid.",
        status: "invalid"
      })
    }
  }

  async function generateNewEncoded(decodedHeader: string, decodedPayload: string, privateKey: string){
    const newSignature = await invoke('gen_sign', {header: decodedHeader, payload: decodedPayload, privateKey: privateKey}) as string;
    const encodedHeader = await encodeBase64(decodedHeader)
    const encodedPayload = await encodeBase64(decodedPayload)

    if (newSignature == "ERROR"){
      return;
    }

    setEncoded(encodedHeader + "." + encodedPayload + "." + newSignature)
    setSignature(newSignature)
    await verifySignature(decodedHeader, decodedPayload, newSignature, publicKey)
  }

  async function userChangedPrivateKey(newPrivateKey: string) {
    setPrivateKey(newPrivateKey)

    await generateNewEncoded(decodedHeader, decodedPayload, newPrivateKey)
  }

  async function userChangedHeader(newHeader: string) {
    setDecodedHeader(newHeader)

    if(!!privateKey){
      await generateNewEncoded(newHeader, decodedPayload, privateKey)
    }else{
      await verifySignature(newHeader, decodedPayload, signature, publicKey)
    }
  }

  async function userChangedPayload(newPayload: string) {
    setDecodedPayload(newPayload)

    if(!!privateKey){
      await generateNewEncoded(decodedHeader, newPayload, privateKey)
    }else {
      await verifySignature(decodedHeader, newPayload, signature, publicKey)
    }
  }

  async function userChangedPublicKey(newPublicKey: string) {
    setPublicKey(newPublicKey)
    await verifySignature(decodedHeader, decodedPayload, signature, newPublicKey)
  }

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <Grid h="100%" grow p="md">
        <Grid.Col h="100%" span={1}>
          <Textarea placeholder='JWT Token' value={encoded} onChange={(evt) => userChangeEncoded(evt.target.value)} h="100%" styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
        </Grid.Col>
        <Grid.Col h="100%" span={1}>
          <Flex gap="xs" direction="column" h="100%">
            <Textarea placeholder='Header' value={decodedHeader} onChange={(evt) => userChangedHeader(evt.target.value)} sx={{flexGrow:1}} styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
            <Textarea placeholder='Payload' value={decodedPayload} onChange={(evt) => userChangedPayload(evt.target.value)} sx={{flexGrow:1}} styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
            <KeyPairSignature onPrivateKeyChange={userChangedPrivateKey} onPublicKeyChange={userChangedPublicKey} signatureStatus={signatureStatus}/>
          </Flex>
        </Grid.Col>
      </Grid>
    </MantineProvider>
  );
}