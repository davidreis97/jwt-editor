// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use openssl::ec::EcKey;
use openssl::rsa::Rsa;
use openssl::hash::MessageDigest;
use openssl::pkey::PKey;
use openssl::sign::{Signer, Verifier};
use base64::{encode_config, decode_config, DecodeError, URL_SAFE_NO_PAD};

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
    let result = std::panic::catch_unwind(|| {
        let pkey = match algorithm {
            "RS256" | "RS384" | "RS512" |
            "PS256" | "PS384" | "PS512" => {
                let rsa_key = match Rsa::private_key_from_pem(private_key.as_bytes()) {
                    Ok(key) => key,
                    Err(_) => return "ERROR".to_string()
                };
                match PKey::from_rsa(rsa_key) {
                    Ok(key) => key,
                    Err(_) => return "ERROR".to_string()
                }
            }
            "ES256" | "ES384" | "ES512" => {
                let ec_key = match EcKey::private_key_from_pem(private_key.as_bytes()) {
                    Ok(key) => key,
                    Err(_) => return "ERROR".to_string()
                };
                match PKey::from_ec_key(ec_key) {
                    Ok(key) => key,
                    Err(_) => return "ERROR".to_string()
                }
            }
            _ => return "ERROR".to_string(),
        };

        let md = match algorithm {
            "RS256" | "ES256" | "PS256" => MessageDigest::sha256(),
            "RS384" | "ES384" | "PS384" => MessageDigest::sha384(),
            "RS512" | "ES512" | "PS512" => MessageDigest::sha512(),
            _ => return "ERROR".to_string(),
        };

        let mut signer = match Signer::new(md, &pkey) {
            Ok(sgn) => sgn,
            Err(_) => return "ERROR".to_string()
        };

        if let "PS256" | "PS384" | "PS512" = algorithm {
            signer.set_rsa_padding(openssl::rsa::Padding::PKCS1_PSS).unwrap();
        }
        
        let data = format!("{}.{}",
            encode_base64_url_safe_helper(header),
            encode_base64_url_safe_helper(payload)
        );
    
        signer.update(data.as_bytes()).unwrap();
        let signature = signer.sign_to_vec().unwrap();
    
        encode_base64_url_safe_helper(&signature)
    });

    match result {
        Ok(signature) => signature,
        Err(_) => "ERROR".to_string(),
    }
}

#[tauri::command]
fn signature_is_valid(header: &str, payload: &str, signature: &str, public_key: &str, algorithm: &str) -> bool {
    let result = std::panic::catch_unwind(|| {
        let jwt_head_payload = format!("{}.{}", header, payload);

        let rsa_pub_key = match Rsa::public_key_from_pem(public_key.as_bytes()) {
            Ok(key) => key,
            Err(_) => return false,
        };

        let pub_key = match PKey::from_rsa(rsa_pub_key) {
            Ok(key) => key,
            Err(_) => return false,
        };

        let decoded_signature = match decode_base64_url_safe_helper(signature) {
            Ok(decoded) => decoded,
            Err(_) => return false,
        };

        let message_digest = match algorithm {
            "RS256" | "PS256" => openssl::hash::MessageDigest::sha256(),
            "RS384" | "PS384" => openssl::hash::MessageDigest::sha384(),
            "RS512" | "PS512" => openssl::hash::MessageDigest::sha512(),
            "ES256" => openssl::hash::MessageDigest::sha256(),
            "ES384" => openssl::hash::MessageDigest::sha384(),
            "ES512" => openssl::hash::MessageDigest::sha512(),
            _ => return false,
        };

        let mut verifier = match Verifier::new(message_digest, &pub_key) {
            Ok(verifier) => verifier,
            Err(_) => return false,
        };

        verifier.update(jwt_head_payload.as_bytes()).unwrap();
        verifier.verify(&decoded_signature).unwrap_or(false)
    });

    match result {
        Ok(is_valid) => is_valid,
        Err(_) => false,
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