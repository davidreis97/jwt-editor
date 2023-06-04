import { Flex, Grid, MantineProvider, Textarea } from '@mantine/core';
import { useState } from 'react';
import SignatureStatus from './helpers/signature-status';
import { signJWT, verifyJWT } from './logic/crypto';
import { base64url } from "jose"
import Signature from './components/signature';
import KeyPair from './helpers/key-pair';

const textDecoder = new TextDecoder()

export default function App() {
  const [jwt, setJwt] = useState<string>("")
  const [decodedHeader, setDecodedHeader] = useState<string>("")
  const [decodedPayload, setDecodedPayload] = useState<string>("")
  const [keyPair, setKeyPair] = useState<KeyPair>({privateKey: "", publicKey: ""})
  const [algorithm, setAlgorithm] = useState<string>("RS256")
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>({
    message:"Insert a token to check signature.",
    status: "info"
  })

  async function handleJwtChange(newJwt: string){
    setJwt(newJwt)
    if (!!!newJwt) {
      setSignatureStatus({
        message:"Insert a token to check signature.",
        status: "info"
      })
    }

    const [newEncodedHeader, newEncodedPayload, _signature] = newJwt.split(".")

    const decodedHeader = textDecoder.decode(base64url.decode(newEncodedHeader ?? ""));
    setDecodedHeader(decodedHeader)

    let newAlg = algorithm;
    try{
      newAlg = JSON.parse(decodedHeader).alg
      if (!!newAlg) {
        setAlgorithm(newAlg)
      }
    } catch(e) {}

    setDecodedPayload(textDecoder.decode(base64url.decode(newEncodedPayload ?? "")))
    await verifySignature(newJwt, keyPair.publicKey, newAlg)
  }

  async function handleHeaderChange(newHeader: string) {
    setDecodedHeader(newHeader)

    if(keyPair.privateKey){
      await generateNewJwt(newHeader, decodedPayload, keyPair.privateKey)
    }else{
      setJwt("")
    }
  }

  async function handlePayloadChange(newPayload: string) {
    setDecodedPayload(newPayload)

    if(keyPair.privateKey){
      await generateNewJwt(decodedHeader, newPayload, keyPair.privateKey)
    }else {
      setJwt("")
    }
  }

  async function handlePublicKeyChange(newPublicKey: string) {
    setKeyPair((kp) => ({...kp, publicKey: newPublicKey}))
    await verifySignature(jwt, newPublicKey, algorithm)
  }

  async function handlePrivateKeyChange(newPrivateKey: string) {
    setKeyPair((kp) => ({...kp, privateKey: newPrivateKey}))
    await generateNewJwt(decodedHeader, decodedPayload, newPrivateKey)
  }

  async function handleSecretChange(newSecret: string) {
    setKeyPair((kp) => ({...kp, publicKey: newSecret, privateKey: newSecret}))

    const newJwt = await generateNewJwt(decodedHeader, decodedPayload, newSecret)
    await verifySignature(newJwt, newSecret, algorithm)
  }

  async function handleAlgorithmChange(newAlgorithm: string) {
    setAlgorithm(newAlgorithm)

    let newDecodedHeader = ""

    try{
      newDecodedHeader = JSON.stringify({...JSON.parse(decodedHeader), alg: newAlgorithm})
      setDecodedHeader(newDecodedHeader)
    }catch(e){}

    const newJwt = await generateNewJwt(newDecodedHeader, decodedPayload, keyPair.privateKey)
    await verifySignature(newJwt, keyPair.publicKey, newAlgorithm)
  }

  async function verifySignature(token: string, publicKey: string, alg: string) {
    if (!!!publicKey) {
      setSignatureStatus({
        message:"Insert a public key to check signature.",
        status: "info"
      })
      return
    }

    let signatureIsValid = false;

    try {
      await verifyJWT(token, publicKey, alg)
      signatureIsValid = true;
    }catch(e){}

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

  async function generateNewJwt(decodedHeader: string, decodedPayload: string, privateKey: string){
    let newJwt = ""

    try{
      newJwt = await signJWT(JSON.parse(decodedHeader), JSON.parse(decodedPayload), privateKey);      
      setJwt(newJwt)
    } catch (e) {}

    return newJwt
  }

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <Grid h="100%" grow pt="md" pr="md" pl="md">
        <Grid.Col h="100%" span={1}>
          <Textarea placeholder='JWT Token' value={jwt} onChange={(evt) => handleJwtChange(evt.target.value)} h="100%" styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
        </Grid.Col>
        <Grid.Col h="100%" span={1}>
          <Flex gap="xs" direction="column" h="100%">
            <Textarea placeholder='Header' value={decodedHeader} onChange={(evt) => handleHeaderChange(evt.target.value)} sx={{flexGrow:1}} styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
            <Textarea placeholder='Payload' value={decodedPayload} onChange={(evt) => handlePayloadChange(evt.target.value)} sx={{flexGrow:1}} styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
            <Signature algorithm={algorithm} keyPair={keyPair} onAlgorithmChange={handleAlgorithmChange} onSecretChange={handleSecretChange} onPrivateKeyChange={handlePrivateKeyChange} onPublicKeyChange={handlePublicKeyChange} signatureStatus={signatureStatus}/>
          </Flex>
        </Grid.Col>
      </Grid>
    </MantineProvider>
  );
}