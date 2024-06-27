export async function encryptFile(fileContent: ArrayBuffer, key: string) {
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encodedKey = new TextEncoder().encode(key);
    const keyMaterial = await crypto.subtle.importKey('raw', encodedKey, 'AES-GCM', false, ['encrypt']);
    const content = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, keyMaterial, fileContent);
    return { iv, content };
}

export async function decryptFile(encryptedContent: Uint8Array, key: string, iv: Uint8Array) {
    const encodedKey = new TextEncoder().encode(key);
    const keyMaterial = await crypto.subtle.importKey('raw', encodedKey, 'AES-GCM', false, ['decrypt']);
    const decryptedContent = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, keyMaterial, encryptedContent.buffer);
    return decryptedContent;
}
