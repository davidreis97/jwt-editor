import { Flex, Grid, MantineProvider, Textarea } from '@mantine/core';
import { useState } from 'react';
import SignatureStatus from './helpers/signature-status';
import { signJWT, verifyJWT } from './logic/crypto';
import { base64url } from "jose"
import Signature from './components/signature';
import KeyPair from './helpers/key-pair';

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

  async function userChangedJwt(newJwt: string){
    setJwt(newJwt)
    if (!!!newJwt) {
      setSignatureStatus({
        message:"Insert a token to check signature.",
        status: "info"
      })
    }

    const [newEncodedHeader, newEncodedPayload, _signature] = newJwt.split(".")

    const decodedHeader = new TextDecoder().decode(base64url.decode(newEncodedHeader ?? ""));
    setDecodedHeader(decodedHeader)

    let newAlg = algorithm;
    try{
      newAlg = JSON.parse(decodedHeader).alg
      if (!!newAlg) {
        setAlgorithm(newAlg)
      }
    } catch(e) {}

    setDecodedPayload(new TextDecoder().decode(base64url.decode(newEncodedPayload ?? "")))
    await verifySignature(newJwt, keyPair.publicKey, newAlg)
  }

  async function userChangedHeader(newHeader: string) {
    setDecodedHeader(newHeader)

    if(!!keyPair.privateKey){
      await generateNewJwt(newHeader, decodedPayload, keyPair.privateKey)
    }else{
      setJwt("")
    }
  }

  async function userChangedPayload(newPayload: string) {
    setDecodedPayload(newPayload)

    if(!!keyPair.privateKey){
      await generateNewJwt(decodedHeader, newPayload, keyPair.privateKey)
    }else {
      setJwt("")
    }
  }

  async function userChangedPublicKey(newPublicKey: string) {
    setKeyPair((kp) => ({...kp, publicKey: newPublicKey}))
    await verifySignature(jwt, newPublicKey, algorithm)
  }

  async function userChangedPrivateKey(newPrivateKey: string) {
    setKeyPair((kp) => ({...kp, privateKey: newPrivateKey}))

    await generateNewJwt(decodedHeader, decodedPayload, newPrivateKey)
  }

  async function userChangedSecret(newSecret: string) {
    setKeyPair((kp) => ({...kp, publicKey: newSecret, privateKey: newSecret}))

    const newJwt = await generateNewJwt(decodedHeader, decodedPayload, newSecret)
    await verifySignature(newJwt, newSecret, algorithm)
  }

  async function userChangedAlgorithm(newAlgorithm: string) {
    setAlgorithm(newAlgorithm)

    try{
      setDecodedHeader(headerStr => {
        const header = JSON.parse(headerStr)
        header.alg = newAlgorithm
        return JSON.stringify(header)
      })
    }catch(e){}

    const newJwt = await generateNewJwt(decodedHeader, decodedPayload, keyPair.privateKey)
    await verifySignature(newJwt, keyPair.publicKey, algorithm)
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
    }catch(e){
      console.log(e)
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

  async function generateNewJwt(decodedHeader: string, decodedPayload: string, privateKey: string){
    let newJwt = ""

    try{
      const newJwt = await signJWT(JSON.parse(decodedHeader), JSON.parse(decodedPayload), privateKey);      
      await verifySignature(newJwt, keyPair.publicKey, algorithm)
      setJwt(newJwt)
    } catch (e) {}

    return newJwt
  }

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <Grid h="100%" grow pt="md" pr="md" pl="md">
        <Grid.Col h="100%" span={1}>
          <Textarea placeholder='JWT Token' value={jwt} onChange={(evt) => userChangedJwt(evt.target.value)} h="100%" styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
        </Grid.Col>
        <Grid.Col h="100%" span={1}>
          <Flex gap="xs" direction="column" h="100%">
            <Textarea placeholder='Header' value={decodedHeader} onChange={(evt) => userChangedHeader(evt.target.value)} sx={{flexGrow:1}} styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
            <Textarea placeholder='Payload' value={decodedPayload} onChange={(evt) => userChangedPayload(evt.target.value)} sx={{flexGrow:1}} styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
            <Signature algorithm={algorithm} keyPair={keyPair} onAlgorithmChange={userChangedAlgorithm /* TODO Should trigger the change of alg in JWT header and the generation of a new token */} onSecretChange={userChangedSecret} onPrivateKeyChange={userChangedPrivateKey} onPublicKeyChange={userChangedPublicKey} signatureStatus={signatureStatus}/>
          </Flex>
        </Grid.Col>
      </Grid>
    </MantineProvider>
  );
}