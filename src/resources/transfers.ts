import type { HttpClient } from '../http-client';
import type {
  PublicStorageTransferRequest,
  PublicStorageTransferResponse,
  StorageSlotContents,
  Transfer,
  TransferCreateRequest,
  TransferTarget,
} from '../types';

/**
 * Transfers resource for ender storage transfer workflows
 */
export class TransfersResource {
  constructor(private client: HttpClient) {}

  /**
   * List all transfers where the authenticated player is sender or recipient
   * @returns Array of transfer records
   */
  async getAll(): Promise<Transfer[]> {
    const response = await this.client.request<Transfer[]>('/v1/transfers');
    return response.data;
  }

  /**
   * Queue a new transfer request
   * @param data - Transfer request payload
   * @returns Transfer record
   */
  async create(data: TransferCreateRequest): Promise<Transfer> {
    const response = await this.client.request<Transfer>('/v1/transfers', {
      method: 'POST',
      body: data,
    });
    return response.data;
  }

  /**
   * Retrieve transfer details by ID
   * @param transferId - Transfer UUID
   * @returns Transfer record
   */
  async get(transferId: string): Promise<Transfer> {
    const response = await this.client.request<Transfer>(`/v1/transfers/${transferId}`);
    return response.data;
  }

  /**
   * Cancel a pending or in-progress transfer
   * @param transferId - Transfer UUID
   * @returns Updated transfer record
   */
  async cancel(transferId: string): Promise<Transfer> {
    const response = await this.client.request<Transfer>(`/v1/transfers/${transferId}/cancel`, {
      method: 'POST',
    });
    return response.data;
  }

  /**
   * Get current ender storage contents for the authenticated player
   * @returns Contents snapshot
   */
  async getContents(): Promise<StorageSlotContents> {
    const response = await this.client.request<StorageSlotContents>('/v1/transfers/contents');
    return response.data;
  }

  /**
   * List active transfer targets available to the authenticated user
   * @returns Array of transfer targets
   */
  async getTargets(): Promise<TransferTarget[]> {
    const response = await this.client.request<TransferTarget[]>('/v1/transfers/targets');
    return response.data;
  }

  /**
   * Request transfer from public/service storage into the authenticated player's storage
   * @param data - Public storage transfer payload
   * @returns Transfer and resolved source entity information
   */
  async requestPublicStorage(
    data: PublicStorageTransferRequest,
  ): Promise<PublicStorageTransferResponse> {
    const response = await this.client.request<PublicStorageTransferResponse>(
      '/v1/requests/public-storage',
      {
        method: 'POST',
        body: data,
      },
    );
    return response.data;
  }
}
