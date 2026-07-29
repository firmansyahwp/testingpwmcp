import fs from 'fs';

import path from 'path';

import dotenv from 'dotenv'


export class ConfigReader {

    private static isLoaded = false;
    
    // =========================================
    // LOAD .ENV -> used to CI/CD
    // =========================================

    private static loadConfig() {
        if (this.isLoaded) return;
        const envPath =
            process.env.CONFIG_PATH ||
            'C:/Testing/.env';
        if (fs.existsSync(envPath)) {
            dotenv.config({
                path: envPath
            });
            console.log(
                `Loaded .env from ${envPath}`
            );
        }
        else {
            console.log(
                'Using environment variables'
            );
        }
        this.isLoaded = true;
    }

    static get(key: string): string {
        this.loadConfig();
        const value = process.env[key];
        if (!value) {
            throw new Error(
                `Config '${key}' not found`
            );
        }
        return value;
    }

    // =========================================
    // CREATE FILE PASSED
    // =========================================

    static createPassedFile(
    directory: string,
    fileName: string
    ): void {
        // make sure folder already exist
        fs.mkdirSync(directory, {
            recursive: true
        });
        const filePath = path.join(
            directory,
            `${fileName}.txt`
        );
        fs.writeFileSync(
            filePath,
            'Passed',
            'utf8'
        );
        console.log(`File created: ${filePath}`);
    }

    // =========================================
    // CHECK FILE PASSED
    // =========================================

    static checkPassedFile(
    statusDirectory: string,
    tcId: string
    ): boolean {
       const filePath = path.join(
        statusDirectory,
        `${tcId}.txt`
    );
       return fs.existsSync(filePath);
    }

}