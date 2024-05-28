import { Box, Flex, JsonInput, MantineProvider, SimpleGrid, Textarea } from '@mantine/core';
import '@mantine/core/styles.css';
import { base64url } from "jose";
import React, { useEffect, useState } from 'react';
import Signature from './components/signature';
import { canJsonParse, cleanUpJsonInput, formatJson } from './helpers/json';
import KeyPair from './helpers/key-pair';
import SignatureStatus from './helpers/signature-status';
import useActiveElement from './helpers/use-active-element';
import { signJWT, verifyJWT } from './logic/crypto';

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

  const focusedElement = useActiveElement();

  const [cursor, setCursor] = useState(0);
  const headerInputRef = React.useRef<HTMLTextAreaElement>(null);
  const payloadInputRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const input = headerInputRef.current;
    if (input && focusedElement == input) input.setSelectionRange(cursor, cursor)
  }, [headerInputRef, cursor, decodedHeader])

  useEffect(() => {
    const input = payloadInputRef.current;
    if (input && focusedElement == input) input.setSelectionRange(cursor, cursor)
  }, [payloadInputRef, cursor, decodedPayload])

  async function handleJwtChange(newJwt: string){
    setJwt(newJwt)
    if (!!!newJwt) {
      setSignatureStatus({
        message:"Insert a token to check signature.",
        status: "info"
      })
    }

    const [newEncodedHeader, newEncodedPayload, _signature] = newJwt.split(".")

    const decodedHeader = formatJson(textDecoder.decode(base64url.decode(newEncodedHeader ?? "")));
    setDecodedHeader(decodedHeader)

    let newAlg = algorithm;
    try{
      newAlg = JSON.parse(decodedHeader).alg
      if (!!newAlg) {
        setAlgorithm(newAlg)
      }
    } catch(e) {}

    setDecodedPayload(formatJson(textDecoder.decode(base64url.decode(newEncodedPayload ?? ""))))
    await verifySignature(newJwt, keyPair.publicKey, newAlg)
  }

  async function handleHeaderChange(newHeader: string) {
    setCursor(headerInputRef.current?.selectionStart ?? 0)
    setDecodedHeader(newHeader)

    await generateNewJwt(newHeader, decodedPayload, keyPair.privateKey, algorithm)
  }

  async function handlePayloadChange(newPayload: string) {
    setCursor(payloadInputRef.current?.selectionStart ?? 0)
    setDecodedPayload(newPayload)

    await generateNewJwt(decodedHeader, newPayload, keyPair.privateKey, algorithm)
  }

  async function handlePublicKeyChange(newPublicKey: string) {
    setKeyPair((kp) => ({...kp, publicKey: newPublicKey}))
    await verifySignature(jwt, newPublicKey, algorithm)
  }

  async function handlePrivateKeyChange(newPrivateKey: string) {
    setKeyPair((kp) => ({...kp, privateKey: newPrivateKey}))
    await generateNewJwt(decodedHeader, decodedPayload, newPrivateKey, algorithm)
  }

  async function handleSecretChange(newSecret: string) {
    setKeyPair((kp) => ({...kp, publicKey: newSecret, privateKey: newSecret}))

    await generateNewJwt(decodedHeader, decodedPayload, newSecret, algorithm, true)
  }

  async function handleAlgorithmChange(newAlgorithm: string) {
    setAlgorithm(newAlgorithm)

    let newDecodedHeader = ""

    try{
      newDecodedHeader = formatJson(JSON.stringify({...JSON.parse(decodedHeader), alg: newAlgorithm}))
      setDecodedHeader(newDecodedHeader)
    }catch(e){}

    await generateNewJwt(newDecodedHeader, decodedPayload, keyPair.privateKey, newAlgorithm)
  }

  async function verifySignature(token: string, publicKey: string, alg: string) {
    if (!!!publicKey) {
      setSignatureStatus({
        message:"Insert a public key to check signature.",
        status: "info"
      })
      return
    }

    if (!!!token) {
      setSignatureStatus({
        message:"Insert a token to check signature.",
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

  async function generateNewJwt(decodedHeader: string, decodedPayload: string, privateKey: string, algorithm: string, isSymmetric: boolean = false){
    let newJwt = ""

    if (!!privateKey){
      try{
        newJwt = await signJWT(JSON.parse(decodedHeader), JSON.parse(decodedPayload), privateKey);      
      } catch (e) {}
    }

    await verifySignature(newJwt, isSymmetric ? privateKey : keyPair.publicKey, algorithm)
    setJwt(newJwt)
  }

  return (
    <MantineProvider defaultColorScheme='dark'>
      <SimpleGrid cols={2} h="100%" p="md">
        <Box>
          <Textarea placeholder='JWT Token' value={jwt} onChange={(evt) => handleJwtChange(evt.target.value)} h="100%" styles={{wrapper:{height: "100%"}, input:{height: "100%"}}} />
        </Box>
        <Box>
          <Flex gap="xs" direction="column" h="100%">
            <JsonInput formatOnBlur ref={headerInputRef} error={!canJsonParse(decodedHeader)} placeholder='Header' value={decodedHeader} onChange={(value) => handleHeaderChange(cleanUpJsonInput(value))} style={{flexGrow:1}} styles={{wrapper:{height: "100%"}, input:{height: "100%", fontSize:"13px"}}} />
            <JsonInput formatOnBlur ref={payloadInputRef} error={!canJsonParse(decodedPayload)} placeholder='Payload' value={decodedPayload} onChange={(value) => handlePayloadChange(cleanUpJsonInput(value))} style={{flexGrow:1}} styles={{wrapper:{height: "100%"}, input:{height: "100%", fontSize: "13px"}}} />
            <Signature algorithm={algorithm} keyPair={keyPair} onAlgorithmChange={handleAlgorithmChange} onSecretChange={handleSecretChange} onPrivateKeyChange={handlePrivateKeyChange} onPublicKeyChange={handlePublicKeyChange} signatureStatus={signatureStatus}/>
          </Flex>
        </Box>
      </SimpleGrid>
    </MantineProvider>
  );
}