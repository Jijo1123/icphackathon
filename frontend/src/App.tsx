import React, { useState, useEffect } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as file_storage_idl, canisterId as file_storage_id } from './declarations';
import { encryptFile, decryptFile } from './encryption';

const agent = new HttpAgent();
const fileStorageActor = Actor.createActor(file_storage_idl, { agent, canisterId: file_storage_id });

function App() {
    const [files, setFiles] = useState<string[]>([]);
    const [encryptionKey, setEncryptionKey] = useState<string>('');

    useEffect(() => {
        async function fetchFiles() {
            const files = await fileStorageActor.list_files() as string[];
            setFiles(files);
        }
        fetchFiles();
    }, []);

    async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file && encryptionKey) {
            const fileContent = await file.arrayBuffer();
            const { iv, content } = await encryptFile(fileContent, encryptionKey);
            await fileStorageActor.upload_file(file.name, [...Array.from(new Uint8Array(iv)), ...Array.from(new Uint8Array(content))]);
            setFiles([...files, file.name]);
        }
    }

    async function handleFileDownload(fileName: string) {
        if (encryptionKey) {
            const fileContent = await fileStorageActor.download_file(fileName) as number[];
            if (fileContent) {
                const iv = fileContent.slice(0, 16);
                const content = fileContent.slice(16);
                const decryptedContent = await decryptFile(new Uint8Array(content), encryptionKey, new Uint8Array(iv));
                const blob = new Blob([decryptedContent]);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }
    }

    return (
        <div className="App">
            <h1>File Storage App</h1>
            <input type="file" onChange={handleFileUpload} />
            <input
                type="text"
                placeholder="Encryption Key"
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
            />
            <ul>
                {files.map((file) => (
                    <li key={file}>
                        {file}
                        <button onClick={() => handleFileDownload(file)}>Download</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
