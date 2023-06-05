<p align="center">
  <img src="https://github.com/davidreis97/jwt-editor/blob/master/src-tauri/icons/128x128.png?raw=true" />
  <h1 align="center">JWT Editor</h1>
</p>

## Purpose

The main purpose for this project is to provide a secure an easy to use tool to enable anyone to safely visualize and edit JWTs.

## Safety

For convenience, I provide compiled releases and the app has support for auto-updates. However, if you want to be completely safe, I'd advise you to review the source code and compile the app yourself.

## Build Instructions

1- Install Rust (https://rustup.rs/)

2- Install Node.JS >= 18.16.0 (https://nodejs.org/)

3- Run `npm install` to install all the Javascript dependencies.

4- Run `npm run tauri build` to compile the Tauri application. More details on building Tauri applications [here](https://tauri.app/v1/guides/building/)