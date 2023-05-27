import { invoke } from '@tauri-apps/api/tauri'

export async function encodeBase64(data: string) : Promise<string> {
    return await invoke('encode_base64_url_safe', {data});
}

export async function decodeBase64(data: string) : Promise<string>{
    return await invoke('decode_base64_url_safe', {data});
}