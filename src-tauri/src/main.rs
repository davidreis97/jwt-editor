// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use openssl::x509::X509;
use base64::{encode_config, decode_config, DecodeError, URL_SAFE_NO_PAD};
use jsonwebtoken::{encode, EncodingKey, Header, decode, Algorithm, DecodingKey, Validation, jwk::Jwk};
use serde_json::{Value, from_str};
use std::collections::HashSet;

#[tauri::command]
fn encode_base64_url_safe(data: &str) -> String {
    encode_base64_url_safe_helper(data)
}

fn encode_base64_url_safe_helper<T: ?Sized + AsRef<[u8]>>(data: &T) -> String {
    encode_config(data, URL_SAFE_NO_PAD)
}

#[tauri::command]
fn decode_base64_url_safe(data: &str) -> String {
    handle_decode_result(decode_base64_url_safe_helper(data))
}

fn decode_base64_url_safe_helper<T: ?Sized + AsRef<[u8]>>(data: &T) -> Result<Vec<u8>, DecodeError> {
    decode_config(data, URL_SAFE_NO_PAD)
}

fn handle_decode_result(result: Result<Vec<u8>, DecodeError>) -> String {
    match result {
        Ok(decoded) => {
            match String::from_utf8(decoded) {
                Ok(s) => s,
                Err(_) => "ERROR".to_string(),
            }
        }
        Err(_) => "ERROR".to_string(),
    }
}

#[tauri::command]
fn gen_sign(header: &str, payload: &str, private_key: &str, algorithm: &str) -> String {
    let alg = match algorithm {
        "RS256" => Algorithm::RS256,
        "RS384" => Algorithm::RS384,
        "RS512" => Algorithm::RS512,
        "ES256" => Algorithm::ES256,
        "ES384" => Algorithm::ES384,
        //"ES512" => Algorithm::ES512, // Not supported yet by jsonwebtoken crate
        "PS256" => Algorithm::PS256,
        "PS384" => Algorithm::PS384,
        "PS512" => Algorithm::PS512,
        "EdDSA" => Algorithm::EdDSA,
        _ => panic!("Unsupported algorithm"),
    };

    // Algorithm rework starts here
    let is_rsa_alg = matches!(
        alg,
        Algorithm::RS256 | Algorithm::RS384 | Algorithm::RS512 
        | Algorithm::PS256 | Algorithm::PS384 | Algorithm::PS512
    );

    let encoding_key = if is_rsa_alg {
        EncodingKey::from_rsa_pem(private_key.as_bytes()).expect("Invalid RSA private key")
    } else {
        EncodingKey::from_ec_pem(private_key.as_bytes()).expect("Invalid EC private key")
    };
    // Algorithm rework ends here

    let header: Header = serde_json::from_str(header).expect("Invalid header content");
    let payload: Value = serde_json::from_str(payload).expect("Invalid payload content");

    encode(&header, &payload, &encoding_key).expect("Failed to generate signature")
}

#[tauri::command]
fn signature_is_valid(jwt: &str, public_key: &str, algorithm: &str) -> bool {
    let public_key_bytes = match X509::from_pem(public_key.as_bytes())
                                    .and_then(|cert| cert.public_key())
                                    .and_then(|pkey| pkey.public_key_to_pem()) {
        Ok(pem) => pem.into_boxed_slice(),
        Err(_) => public_key.as_bytes().into(),
    };

    let decoding_key = match from_str::<Jwk>(public_key) {
        Ok(jwk) => match DecodingKey::from_jwk(&jwk) {
            Ok(key) => key,
            Err(_) => return false
        },
        Err(_) => match algorithm {
            "RS256" | "RS384" | "RS512" |
            "PS256" | "PS384" | "PS512" => {
                match DecodingKey::from_rsa_pem(public_key_bytes.as_ref()) {
                    Ok(key) => key,
                    Err(_) => return false,
                }
            }
            "ES256" | "ES384" | "ES512" => {
                match DecodingKey::from_ec_pem(public_key_bytes.as_ref()) {
                    Ok(key) => key,
                    Err(_) => return false,
                }
            }
            "EdDSA" => {
                match DecodingKey::from_ed_pem(public_key_bytes.as_ref()) {
                    Ok(key) => key,
                    Err(_) => return false,
                }
            }
            _ => return false,
        }
    };

    let algorithm_type = match algorithm {
        "RS256" => Algorithm::RS256,
        "RS384" => Algorithm::RS384,
        "RS512" => Algorithm::RS512,
        "ES256" => Algorithm::ES256,
        "ES384" => Algorithm::ES384,
        //"ES512" => Algorithm::ES512, // Not supported yet by jsonwebtoken crate
        "PS256" => Algorithm::PS256,
        "PS384" => Algorithm::PS384,
        "PS512" => Algorithm::PS512,
        "EdDSA" => Algorithm::EdDSA,
        _ => return false,
    };

    let mut validation = Validation::default();
    validation.required_spec_claims = HashSet::new();
    validation.algorithms = vec![algorithm_type];
    validation.validate_exp = false;
    validation.validate_nbf = false;
    match decode::<serde_json::Value>(jwt, &decoding_key, &validation) {
        Ok(_) => true,
        Err(e) => panic!("{}", e),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            gen_sign,
            signature_is_valid,
            encode_base64_url_safe,
            decode_base64_url_safe
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}