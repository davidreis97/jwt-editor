<div align="center">
  <img src="https://github.com/davidreis97/jwt-editor/blob/master/src-tauri/icons/128x128.png?raw=true" alt="JWT logo" />
  <h1>JWT Editor</h1>
</div>

## Overview

JWT Editor is a secure and easy-to-use offline tool designed for visualizing and editing JSON Web Tokens (JWTs).

<div align="center">
  <img src="https://github.com/davidreis97/jwt-editor/blob/master/assets/screenshot.png?raw=true" alt="Application screenshot" />
</div>

## Features

- Decode JWT tokens and visualize their JSON header and payload.
- Verify the signature of a JWT using a provided public key.
- Sign a JWT using a provided private key or secret.
- Supports the following algorithms:
  - HS256, HS384, HS512
  - RS256, RS384, RS512
  - ES256, ES384, ES512
  - PS256, PS384, PS512
- Supports the following public and private key formats:
  - PKCS8
  - JWK
  - SPKI
  - X.509 Certificate

JWT Editor aims to achieve feature parity with [jwt.io](https://jwt.io) as its offline counterpart and expand on that. If you are missing a feature, please [create an issue](https://github.com/davidreis97/jwt-editor/issues/new).

## Security

For maximum security, I recommend reviewing the source code and compiling the app yourself, although [compiled releases](https://github.com/davidreis97/jwt-editor/releases/latest/) and auto-update support are provided for convenience.

## Build Instructions

1. Install Rust (https://rustup.rs/)
2. Install Node.JS >= 18.16.0 (https://nodejs.org/)
3. Run `npm install` to install all necessary JavaScript dependencies.
4. Run `npm run tauri build` to compile the Tauri application. More details on building Tauri applications can be found [here](https://tauri.app/v1/guides/building/).