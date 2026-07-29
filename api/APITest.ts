import {
    APIRequestContext,
    APIResponse
} from '@playwright/test';

import { APIManager }
from './APIManager';

export class APITest {

    private api: APIManager;

    constructor(request: APIRequestContext) {
        this.api = new APIManager(request);
    }

    // =========================================
    // PARSE JSON SAFE
    // =========================================
    private parseJSON(data: any) {
        try {
            return data
                ? JSON.parse(data)
                : undefined;
        } catch {
            return undefined;
        }
    }

    // =========================================
    // EXECUTE FROM EXCEL
    // =========================================
    async executeFromExcel(row: any): Promise<APIResponse> {
        const method = row.METHOD;
        const url = row.URL;
        const contentType = row.CONTENT_TYPE;
        const params = this.parseJSON(row.PARAMS);
        const headers = this.parseJSON(row.HEADERS);
        const body = this.parseJSON(row.BODY);
        const authType = row.AUTH_TYPE;
        const token = row.TOKEN;
        const username = row.USERNAME;
        const password = row.PASSWORD;
        const timeout = row.TIMEOUT ? Number(row.TIMEOUT) : 30000;
        return await this.api.execute({
            method,
            url,
            contentType,
            params,
            headers,
            body,
            authType,
            token,
            username,
            password,
            timeout
        });
    }

    // =========================================
    // VALIDATE STATUS
    // =========================================
    async validateStatus(response: APIResponse, expectedStatus: number) {
        if (response.status() !== expectedStatus) {
            throw new Error(
                `Expected status ${expectedStatus} but actual status got ${response.status()}`
            );
        }
    }

    // =========================================
    // VALIDATE TEXT
    // =========================================
    async validateText(response: APIResponse, expectedText: string) {
        const responseText = await response.text();
        if (!responseText.includes(expectedText)) {
            throw new Error(
                `Expected text not found: ${expectedText}`
            );
        }
    }

    // =========================================
    // GET RESPONSE BODY
    // =========================================
    async getResponseBody(response: APIResponse) {
        try {
            return await response.json();
        } catch {
            return await response.text();
        }
    }
}