import { Flex, Grid, MantineProvider, Textarea } from '@mantine/core';
import { useState } from 'react';
import SignatureStatus from './helpers/signature-status';
import { signJWT, verifyJWT } from './logic/crypto';
import { base64url } from "jose"
import Signature from './components/signature';

export default function App() {
  const [jwt, setJwt] = useState<string>("")
  const [decodedHeader, setDecodedHeader] = useState<string>("")
  const [decodedPayload, setDecodedPayload] = useState<string>("")
  const [publicKey, setPublicKey] = useState<string>("")
  const [privateKey, setPrivateKey] = useState<string>("")
  const [algorithm, setAlgorithm] = useState<string>("RS256")
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>({
    message:"Insert a token to check signature.",
    status: "info"
  })

  async function userChangeEncoded(newJwt: string){
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
      if (!!newAlg) { // ++ Check if algorithm is valid and supported
        setAlgorithm(newAlg)
      }
    } catch(e) {}

    setDecodedPayload(new TextDecoder().decode(base64url.decode(newEncodedPayload ?? "")))
    await verifySignature(newJwt, publicKey, newAlg)
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
      setJwt("")
    }
  }

  async function userChangedPayload(newPayload: string) {
    setDecodedPayload(newPayload)

    if(!!privateKey){
      await generateNewEncoded(decodedHeader, newPayload, privateKey)
    }else {
      setJwt("")
    }
  }

  async function userChangedPublicKey(newPublicKey: string) {
    setPublicKey(newPublicKey)
    await verifySignature(jwt, newPublicKey, algorithm)
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

  async function generateNewEncoded(decodedHeader: string, decodedPayload: string, privateKey: string){
    try{
      const newJwt = await signJWT(JSON.parse(decodedHeader), JSON.parse(decodedPayload), privateKey);
      
      setJwt(newJwt)
      await verifySignature(newJwt, publicKey, algorithm)
    } catch (e) {}    
  }

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <Grid h="100%" grow p="md">
        <Grid.Col h="100%" span={1}>
          <Textarea placeholder='JWT Token' value={jwt} onChange={(evt) => userChangeEncoded(evt.target.value)} h="100%" styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
        </Grid.Col>
        <Grid.Col h="100%" span={1}>
          <Flex gap="xs" direction="column" h="100%">
            <Textarea placeholder='Header' value={decodedHeader} onChange={(evt) => userChangedHeader(evt.target.value)} sx={{flexGrow:1}} styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
            <Textarea placeholder='Payload' value={decodedPayload} onChange={(evt) => userChangedPayload(evt.target.value)} sx={{flexGrow:1}} styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
            <Signature algorithm={algorithm} onAlgorithmChange={setAlgorithm} onPrivateKeyChange={userChangedPrivateKey} onPublicKeyChange={userChangedPublicKey} signatureStatus={signatureStatus}/>
          </Flex>
        </Grid.Col>
      </Grid>
    </MantineProvider>
  );
}