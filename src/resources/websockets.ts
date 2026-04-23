/// <reference lib="dom" />
import type { HttpClient } from '../http-client';
import type {
    Transfer,
    TransferCreateRequest,
    TransferTarget,
    WebsocketAuthOk,
    WebsocketEnvelope,
    WebsocketErrorPayload,
    WebsocketMessageId,
    WebsocketTargetListPayload,
    WebsocketTransferListPayload,
} from '../types';

interface WebSocketLike {
    readyState: number;
    send(data: string): void;
    close(code?: number, reason?: string): void;
    onopen: (() => void) | null;
    onmessage: ((event: { data: string }) => void) | null;
    onerror: (() => void) | null;
    onclose: ((event: { code: number; reason: string }) => void) | null;
}

type PendingRequest = {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
};

export interface WebsocketClientOptions {
    connectTimeoutMs?: number;
    requestTimeoutMs?: number;
    webSocketFactory?: (url: string) => WebSocketLike;
}

export class WebsocketProtocolError extends Error {
    public readonly code: string;
    public readonly requestId?: WebsocketMessageId;

    constructor(message: string, code: string, requestId?: WebsocketMessageId) {
        super(message);
        this.name = 'WebsocketProtocolError';
        this.code = code;
        this.requestId = requestId;
    }
}

/**
 * WebSocket resource for realtime transfer operations
 */
export class WebsocketsResource {
    private ws: WebSocketLike | null = null;
    private connectPromise: Promise<WebsocketEnvelope> | null = null;
    private pending = new Map<WebsocketMessageId, PendingRequest>();
    private transferUpdateListeners = new Set<(transfer: Transfer) => void>();
    private nextRequestId = 1;

    private readonly connectTimeoutMs: number;
    private readonly requestTimeoutMs: number;
    private readonly webSocketFactory: (url: string) => WebSocketLike;

    constructor(
        private client: HttpClient,
        options: WebsocketClientOptions = {},
    ) {
        this.connectTimeoutMs = options.connectTimeoutMs ?? 10000;
        this.requestTimeoutMs = options.requestTimeoutMs ?? 15000;
        this.webSocketFactory = options.webSocketFactory ?? this.getDefaultWebSocketFactory();
    }

    /**
     * Open websocket connection and wait for initial hello
     */
    async start(): Promise<WebsocketEnvelope> {
        if (this.connectPromise) {
            return this.connectPromise;
        }

        const url = this.buildWebSocketUrl();
        this.connectPromise = new Promise<WebsocketEnvelope>((resolve, reject) => {
            const ws = this.webSocketFactory(url);
            this.ws = ws;

            const timeout = setTimeout(() => {
                this.connectPromise = null;
                this.ws = null;
                try {
                    ws.close();
                } catch {
                    // No-op if close fails while establishing connection.
                }
                reject(new Error(`WebSocket connection timeout after ${this.connectTimeoutMs}ms`));
            }, this.connectTimeoutMs);

            ws.onopen = () => {
                // Wait for server hello before resolving start().
            };

            ws.onmessage = (event) => {
                this.handleMessageEvent(event.data, resolve, reject, timeout);
            };

            ws.onerror = () => {
                clearTimeout(timeout);
                this.connectPromise = null;
                this.ws = null;
                reject(new Error('WebSocket connection failed'));
            };

            ws.onclose = (event) => {
                clearTimeout(timeout);
                this.connectPromise = null;
                this.ws = null;
                this.rejectAllPending(
                    new Error(`WebSocket closed (${event.code}${event.reason ? `: ${event.reason}` : ''})`),
                );
            };
        });

        return this.connectPromise;
    }

    /**
     * Authenticate this connection as a client key
     */
    async authenticate(token: string, id: WebsocketMessageId = this.createRequestId()): Promise<WebsocketAuthOk> {
        const response = await this.sendAndWait<WebsocketAuthOk>('auth', {
            type: 'auth',
            id,
            token,
        });

        if (response.type !== 'auth_ok') {
            throw new Error(`Unexpected auth response type: ${response.type}`);
        }

        return response.payload;
    }

    /**
     * Ping the websocket server
     */
    async ping(id: WebsocketMessageId = this.createRequestId()): Promise<number> {
        const response = await this.sendAndWait<number>('ping', {
            type: 'ping',
            id,
        });

        if (response.type !== 'pong') {
            throw new Error(`Unexpected ping response type: ${response.type}`);
        }

        return response.payload;
    }

    /**
     * Create a transfer over websocket
     */
    async createTransfer(
        payload: TransferCreateRequest,
        id: WebsocketMessageId = this.createRequestId(),
    ): Promise<Transfer> {
        const response = await this.sendAndWait<Transfer>('create_transfer', {
            type: 'create_transfer',
            id,
            payload,
        });

        if (response.type !== 'create_transfer_ok') {
            throw new Error(`Unexpected create_transfer response type: ${response.type}`);
        }

        return response.payload;
    }

    /**
     * Fetch transfer by id
     */
    async getTransfer(
        transferId: string,
        id: WebsocketMessageId = this.createRequestId(),
    ): Promise<Transfer> {
        const response = await this.sendAndWait<Transfer>('get_transfer', {
            type: 'get_transfer',
            id,
            payload: { transferId },
        });

        if (response.type !== 'get_transfer_ok') {
            throw new Error(`Unexpected get_transfer response type: ${response.type}`);
        }

        return response.payload;
    }

    /**
     * Cancel transfer by id
     */
    async cancelTransfer(
        transferId: string,
        id: WebsocketMessageId = this.createRequestId(),
    ): Promise<Transfer> {
        const response = await this.sendAndWait<Transfer>('cancel_transfer', {
            type: 'cancel_transfer',
            id,
            payload: { transferId },
        });

        if (response.type !== 'cancel_transfer_ok') {
            throw new Error(`Unexpected cancel_transfer response type: ${response.type}`);
        }

        return response.payload;
    }

    /**
     * List transfers for this client
     */
    async listTransfers(id: WebsocketMessageId = this.createRequestId()): Promise<Transfer[]> {
        const response = await this.sendAndWait<WebsocketTransferListPayload>('list_transfers', {
            type: 'list_transfers',
            id,
            payload: {},
        });

        if (response.type !== 'list_transfers_ok') {
            throw new Error(`Unexpected list_transfers response type: ${response.type}`);
        }

        return response.payload.transfers;
    }

    /**
     * List targets available to this client
     */
    async listTargets(id: WebsocketMessageId = this.createRequestId()): Promise<TransferTarget[]> {
        const response = await this.sendAndWait<WebsocketTargetListPayload>('list_targets', {
            type: 'list_targets',
            id,
            payload: {},
        });

        if (response.type !== 'list_targets_ok') {
            throw new Error(`Unexpected list_targets response type: ${response.type}`);
        }

        return response.payload.targets;
    }

    /**
     * Subscribe to unsolicited transfer updates.
     * Returns an unsubscribe function.
     */
    onTransferUpdate(listener: (transfer: Transfer) => void): () => void {
        this.transferUpdateListeners.add(listener);
        return () => {
            this.transferUpdateListeners.delete(listener);
        };
    }

    /**
     * Close the websocket connection
     */
    close(code?: number, reason?: string): void {
        if (!this.ws) {
            return;
        }

        try {
            this.ws.close(code, reason);
        } finally {
            this.ws = null;
            this.connectPromise = null;
            this.rejectAllPending(new Error('WebSocket connection closed'));
        }
    }

    /**
     * True if the websocket is currently open
     */
    isConnected(): boolean {
        return Boolean(this.ws && this.ws.readyState === 1);
    }

    private async sendAndWait<TPayload>(
        messageType: string,
        message: Record<string, unknown>,
    ): Promise<WebsocketEnvelope<TPayload>> {
        if (!this.ws || this.ws.readyState !== 1) {
            await this.start();
        }

        if (!this.ws || this.ws.readyState !== 1) {
            throw new Error('WebSocket is not connected');
        }

        const requestId = message.id as WebsocketMessageId;
        const responsePromise = new Promise<WebsocketEnvelope<TPayload>>((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pending.delete(requestId);
                reject(new Error(`WebSocket ${messageType} request timed out after ${this.requestTimeoutMs}ms`));
            }, this.requestTimeoutMs);

            this.pending.set(requestId, {
                resolve: (value) => resolve(value as WebsocketEnvelope<TPayload>),
                reject,
                timeout,
            });
        });

        this.ws.send(JSON.stringify(message));
        return responsePromise;
    }

    private handleMessageEvent(
        rawData: string,
        connectResolve: (value: WebsocketEnvelope) => void,
        connectReject: (error: Error) => void,
        connectTimeout: ReturnType<typeof setTimeout>,
    ): void {
        const parsed = this.safeParse(rawData);
        if (!parsed) {
            return;
        }

        if (parsed.type === 'hello') {
            clearTimeout(connectTimeout);
            connectResolve(parsed);
            return;
        }

        if (parsed.type === 'transfer_update') {
            this.emitTransferUpdate(parsed.payload as Transfer);
            return;
        }

        if (typeof parsed.id === 'undefined') {
            if (parsed.type === 'error') {
                const payload = parsed.payload as WebsocketErrorPayload;
                connectReject(new WebsocketProtocolError(payload.message, payload.code));
            }
            return;
        }

        const pending = this.pending.get(parsed.id);
        if (!pending) {
            return;
        }

        clearTimeout(pending.timeout);
        this.pending.delete(parsed.id);

        if (parsed.type === 'error') {
            const payload = parsed.payload as WebsocketErrorPayload;
            pending.reject(new WebsocketProtocolError(payload.message, payload.code, parsed.id));
            return;
        }

        pending.resolve(parsed);
    }

    private emitTransferUpdate(transfer: Transfer): void {
        for (const listener of this.transferUpdateListeners) {
            listener(transfer);
        }
    }

    private safeParse(rawData: string): WebsocketEnvelope | null {
        try {
            const parsed = JSON.parse(rawData) as WebsocketEnvelope;
            if (!parsed || typeof parsed !== 'object' || typeof parsed.type !== 'string') {
                return null;
            }
            return parsed;
        } catch {
            return null;
        }
    }

    private createRequestId(): number {
        const id = this.nextRequestId;
        this.nextRequestId += 1;
        return id;
    }

    private rejectAllPending(error: Error): void {
        for (const entry of this.pending.values()) {
            clearTimeout(entry.timeout);
            entry.reject(error);
        }
        this.pending.clear();
    }

    private buildWebSocketUrl(): string {
        const base = new URL(this.client.getBaseUrl());
        base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';

        const trimmedPath = base.pathname.replace(/\/+$/, '');
        if (trimmedPath.endsWith('/api/v1')) {
            base.pathname = `${trimmedPath}/ws`;
        } else if (trimmedPath.endsWith('/api')) {
            base.pathname = `${trimmedPath}/v1/ws`;
        } else if (trimmedPath.endsWith('/v1')) {
            base.pathname = `${trimmedPath}/ws`;
        } else {
            // Default hosts use /v1 directly.
            base.pathname = '/v1/ws';
        }

        base.search = '';
        base.hash = '';
        return base.toString();
    }

    private getDefaultWebSocketFactory(): (url: string) => WebSocketLike {
        return (url: string) => {
            if (typeof globalThis.WebSocket === 'undefined') {
                throw new Error('WebSocket is not available. Provide a webSocketFactory in WebsocketsResource options.');
            }

            return new globalThis.WebSocket(url) as unknown as WebSocketLike;
        };
    }
}