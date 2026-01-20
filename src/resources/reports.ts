import type { HttpClient } from '../http-client';
import type { ReportRecords, ChangeLogResult, ChangeLogOptions } from '../types';

/**
 * Reports resource for retrieving ShopSync statistics and change logs
 */
export class ReportsResource {
  constructor(private client: HttpClient) {}

  /**
   * Retrieve overall statistics for ShopSync reports
   * @returns Statistics object
   */
  async getStats(): Promise<unknown> {
    const response = await this.client.request<unknown>('/v1/reports/stats');
    return response.data;
  }

  /**
   * Retrieve recent validation failures
   * @param options - Query options
   * @param options.limit - Maximum records to return (default: 50)
   * @returns Validation failure records
   */
  async getValidationFailures(options?: { limit?: number }): Promise<ReportRecords> {
    const response = await this.client.request<ReportRecords>('/v1/reports/validation-failures', {
      params: {
        limit: options?.limit || 50,
      },
    });
    return response.data;
  }

  /**
   * Retrieve recent successful ShopSync posts
   * @param options - Query options
   * @param options.limit - Maximum records to return (default: 50)
   * @returns Successful post records
   */
  async getSuccessfulPosts(options?: { limit?: number }): Promise<ReportRecords> {
    const response = await this.client.request<ReportRecords>('/v1/reports/successful-posts', {
      params: {
        limit: options?.limit || 50,
      },
    });
    return response.data;
  }

  /**
   * Retrieve recent shop change events
   * @param options - Query options
   * @param options.limit - Maximum records to return (default: 50)
   * @param options.shopId - Filter by shop ID
   * @returns Shop change event records
   */
  async getShopChanges(options?: { limit?: number; shopId?: string }): Promise<ReportRecords> {
    const response = await this.client.request<ReportRecords>('/v1/reports/shop-changes', {
      params: {
        limit: options?.limit || 50,
        shopId: options?.shopId,
      },
    });
    return response.data;
  }

  /**
   * Retrieve recent item change events
   * @param options - Query options
   * @param options.limit - Maximum records to return (default: 50)
   * @param options.shopId - Filter by shop ID
   * @returns Item change event records
   */
  async getItemChanges(options?: { limit?: number; shopId?: string }): Promise<ReportRecords> {
    const response = await this.client.request<ReportRecords>('/v1/reports/item-changes', {
      params: {
        limit: options?.limit || 50,
        shopId: options?.shopId,
      },
    });
    return response.data;
  }

  /**
   * Retrieve shop change logs from the database
   * @param options - Query options including pagination and filtering
   * @returns Shop change logs
   */
  async getShopChangeLogs(options?: ChangeLogOptions): Promise<ChangeLogResult> {
    const response = await this.client.request<ChangeLogResult>('/v1/reports/shop-change-logs', {
      params: {
        limit: options?.limit,
        offset: options?.offset,
        shopId: options?.shopId,
        since: options?.since,
        until: options?.until,
      },
    });
    return response.data;
  }

  /**
   * Retrieve item change logs from the database
   * @param options - Query options including pagination and filtering
   * @returns Item change logs
   */
  async getItemChangeLogs(options?: ChangeLogOptions): Promise<ChangeLogResult> {
    const response = await this.client.request<ChangeLogResult>('/v1/reports/item-change-logs', {
      params: {
        limit: options?.limit,
        offset: options?.offset,
        shopId: options?.shopId,
        since: options?.since,
        until: options?.until,
      },
    });
    return response.data;
  }

  /**
   * Retrieve price change logs from the database
   * @param options - Query options including pagination and filtering
   * @returns Price change logs
   */
  async getPriceChangeLogs(options?: ChangeLogOptions): Promise<ChangeLogResult> {
    const response = await this.client.request<ChangeLogResult>('/v1/reports/price-change-logs', {
      params: {
        limit: options?.limit,
        offset: options?.offset,
        shopId: options?.shopId,
        since: options?.since,
        until: options?.until,
      },
    });
    return response.data;
  }

  /**
   * Retrieve a specific report record by ID
   * @param id - Report record ID
   * @returns Report record
   * @throws KrawletError with NOT_FOUND if record doesn't exist
   */
  async get(id: string): Promise<unknown> {
    const response = await this.client.request<unknown>(`/v1/reports/${id}`);
    return response.data;
  }
}
