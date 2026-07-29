import {
    APIRequestContext,
    APIResponse
} from '@playwright/test';

export class APIManager {

    private request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    // =========================================
    // EXECUTE API
    // =========================================

    async execute(config: {
        method: string,
        url: string,
        contentType?: string,
        params?: any,
        headers?: any,
        body?: any,
        authType?: string,
        token?: string,
        username?: string,
        password?: string,
        timeout?: number
        maxRedirects?: number
    }): Promise<APIResponse> {
        const headers = config.headers || {};
        // =====================================
        // AUTHORIZATION
        // =====================================
        if (config.authType === 'Bearer') {
            headers[
                'Authorization'
            ] = `Bearer ${config.token}`;
        }
        if (config.authType === 'Basic') {
            const encoded =
                Buffer
                    .from(
                        `${config.username}:${config.password}`
                    )
                    .toString('base64');
            headers[
                'Authorization'
            ] = `Basic ${encoded}`;
        }
        // =====================================
        // REQUEST OPTIONS
        // =====================================
        const requestOptions: any = {
            method:
                config.method,
            headers,
            params:
                config.params,
            timeout:
                config.timeout || 30000,
            //for first response without redirect to end point    
            //maxRedirects: 0    
        };
        // =====================================
        // CONTENT TYPE HANDLER
        // =====================================
        switch (config.contentType) {
            // =================================
            // JSON
            // =================================
            case 'application/json':
                headers[
                    'Content-Type'
                ] = 'application/json';
                requestOptions.data =
                    config.body;
                break;
            // =================================
            // X-WWW-FORM-URLENCODED
            // =================================
            case 'x-www-form-urlencoded':
                headers[
                    'Content-Type'
                ] =
                    'application/x-www-form-urlencoded';
                requestOptions.form =
                    config.body;
                break;
            // =================================
            // MULTIPART FORM DATA
            // =================================
            case 'multipart/form-data':
                requestOptions.multipart =
                    config.body;
                break;
            // =================================
            // TEXT PLAIN
            // =================================
            case 'text/plain':
                headers[
                    'Content-Type'
                ] = 'text/plain';
                requestOptions.data =
                    config.body;
                break;
            // =================================
            // DEFAULT
            // =================================

            default:
                requestOptions.data =
                    config.body;
                break;
        }
        // =====================================
        // EXECUTE
        // =====================================
        return await this.request.fetch(
            config.url,
            requestOptions
        );
    }
}