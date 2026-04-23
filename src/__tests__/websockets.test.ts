import { describe, it, expect, beforeEach } from 'vitest';
import { WebsocketsResource, WebsocketProtocolError } from '../resources/websockets';
import { HttpClient } from '../http-client';
import type { Transfer } from '../types';

type MessageHandler = ((event: { data: string }) => void) | null;

type OpenHandler = (() => void) | null;

type ErrorHandler = (() => void) | null;

type CloseHandler = ((event: { code: number; reason: string }) => void) | null;

class MockWebSocket {
  public readonly url: string;
  public readyState = 0;
  public onopen: OpenHandler = null;
  public onmessage: MessageHandler = null;
  public onerror: ErrorHandler = null;
  public onclose: CloseHandler = null;

  public sent: string[] = [];

  constructor(url: string) {
    this.url = url;
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(code = 1000, reason = ''): void {
    this.readyState = 3;
    this.onclose?.({ code, reason });
  }

  open(): void {
    this.readyState = 1;
    this.onopen?.();
  }

  serverMessage(payload: unknown): void {
    this.onmessage?.({ data: JSON.stringify(payload) });
  }
}

describe('WebsocketsResource', () => {
  let client: HttpClient;
  let mockSocket: MockWebSocket;
  let sockets: WebsocketsResource;

  const mockTransfer: Transfer = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    status: 'pending',
    error: null,
    fromEntityId: 'd98440d6-5117-4ac8-bd50-70b086101e3e',
    fromUsername: 'Twijn',
    fromMcUuid: 'd98440d6-5117-4ac8-bd50-70b086101e3e',
    fromMcName: 'Twijn',
    toEntityId: 'a1234567-89ab-cdef-0123-456789abcdef',
    toUsername: 'Player2',
    toMcUuid: 'a1234567-89ab-cdef-0123-456789abcdef',
    toMcName: 'Player2',
    itemName: 'minecraft:diamond',
    itemNbt: null,
    memo: 'test transfer memo',
    quantity: 64,
    quantityTransferred: 0,
    timestamp: '2026-04-12T10:30:00.000Z',
  };

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.krawlet.cc',
      apiKey: 'kraw_test_key',
    });

    mockSocket = new MockWebSocket('');
    sockets = new WebsocketsResource(client, {
      webSocketFactory: (url: string) => {
        mockSocket = new MockWebSocket(url);
        return mockSocket;
      },
      connectTimeoutMs: 100,
      requestTimeoutMs: 100,
    });
  });

  it('should connect to /v1/ws and resolve hello', async () => {
    const startPromise = sockets.start();

    mockSocket.open();
    mockSocket.serverMessage({
      type: 'hello',
      payload: {
        supportedClientMessages: ['auth', 'ping', 'create_transfer'],
      },
    });

    const hello = await startPromise;

    expect(mockSocket.url).toBe('wss://api.krawlet.cc/v1/ws');
    expect(hello.type).toBe('hello');
  });

  it('should authenticate using auth message and return auth_ok payload', async () => {
    const startPromise = sockets.start();
    mockSocket.open();
    mockSocket.serverMessage({ type: 'hello', payload: { supportedClientMessages: ['auth'] } });
    await startPromise;

    const authPromise = sockets.authenticate('kraw_abc123', 7);

    expect(mockSocket.sent).toHaveLength(1);
    expect(JSON.parse(mockSocket.sent[0])).toEqual({
      type: 'auth',
      id: 7,
      token: 'kraw_abc123',
    });

    mockSocket.serverMessage({
      type: 'auth_ok',
      id: 7,
      payload: {
        tier: 'free',
        name: 'test-key',
        role: 'client',
      },
    });

    await expect(authPromise).resolves.toEqual({
      tier: 'free',
      name: 'test-key',
      role: 'client',
    });
  });

  it('should send ping and resolve pong timestamp', async () => {
    const startPromise = sockets.start();
    mockSocket.open();
    mockSocket.serverMessage({ type: 'hello', payload: {} });
    await startPromise;

    const pingPromise = sockets.ping('abc');

    expect(JSON.parse(mockSocket.sent[0])).toEqual({ type: 'ping', id: 'abc' });

    mockSocket.serverMessage({
      type: 'pong',
      id: 'abc',
      payload: 1710000000000,
    });

    await expect(pingPromise).resolves.toBe(1710000000000);
  });

  it('should receive transfer_update events', async () => {
    const startPromise = sockets.start();
    mockSocket.open();
    mockSocket.serverMessage({ type: 'hello', payload: {} });
    await startPromise;

    let received: Transfer | null = null;
    sockets.onTransferUpdate((transfer) => {
      received = transfer;
    });

    mockSocket.serverMessage({
      type: 'transfer_update',
      payload: mockTransfer,
    });

    expect(received).toEqual(mockTransfer);
  });

  it('should reject requests with protocol error envelopes', async () => {
    const startPromise = sockets.start();
    mockSocket.open();
    mockSocket.serverMessage({ type: 'hello', payload: {} });
    await startPromise;

    const listPromise = sockets.listTransfers(9);

    mockSocket.serverMessage({
      type: 'error',
      id: 9,
      payload: {
        code: 'UNAUTHENTICATED',
        message: 'You must authenticate first',
      },
    });

    await expect(listPromise).rejects.toEqual(
      expect.objectContaining({
        name: 'WebsocketProtocolError',
        code: 'UNAUTHENTICATED',
        requestId: 9,
      }),
    );
  });

  it('should support listTargets/listTransfers/create/get/cancel helpers', async () => {
    const startPromise = sockets.start();
    mockSocket.open();
    mockSocket.serverMessage({ type: 'hello', payload: {} });
    await startPromise;

    const listTargetsPromise = sockets.listTargets(1);
    mockSocket.serverMessage({
      type: 'list_targets_ok',
      id: 1,
      payload: {
        targets: [
          {
            id: 'entity-1',
            name: 'Player2',
            type: 'player',
            mcUuid: 'a1234567-89ab-cdef-0123-456789abcdef',
            mcName: 'Player2',
            links: [{ type: 'minecraft_name', value: 'Player2' }],
          },
        ],
      },
    });

    const listTransfersPromise = sockets.listTransfers(2);
    mockSocket.serverMessage({
      type: 'list_transfers_ok',
      id: 2,
      payload: {
        transfers: [mockTransfer],
      },
    });

    const createPromise = sockets.createTransfer({ to: 'Player2', quantity: 1 }, 3);
    mockSocket.serverMessage({
      type: 'create_transfer_ok',
      id: 3,
      payload: mockTransfer,
    });

    const getPromise = sockets.getTransfer(mockTransfer.id, 4);
    mockSocket.serverMessage({
      type: 'get_transfer_ok',
      id: 4,
      payload: mockTransfer,
    });

    const cancelPromise = sockets.cancelTransfer(mockTransfer.id, 5);
    mockSocket.serverMessage({
      type: 'cancel_transfer_ok',
      id: 5,
      payload: {
        ...mockTransfer,
        status: 'cancelled',
      },
    });

    await expect(listTargetsPromise).resolves.toHaveLength(1);
    await expect(listTransfersPromise).resolves.toEqual([mockTransfer]);
    await expect(createPromise).resolves.toEqual(mockTransfer);
    await expect(getPromise).resolves.toEqual(mockTransfer);
    await expect(cancelPromise).resolves.toEqual({ ...mockTransfer, status: 'cancelled' });
  });

  it('should expose protocol error class', () => {
    const error = new WebsocketProtocolError('No auth', 'UNAUTHENTICATED', 1);
    expect(error.name).toBe('WebsocketProtocolError');
    expect(error.code).toBe('UNAUTHENTICATED');
    expect(error.requestId).toBe(1);
  });
});
