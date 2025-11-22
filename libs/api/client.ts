/**
 * 統一 API Client
 * 提供統一的 API 呼叫介面，包含錯誤處理、重試機制等
 */

import { handleApiError, handleError, getDefaultErrorMessage } from "@/libs/utils/error-handler";

export interface ApiClientOptions {
  /** 基礎 URL */
  baseURL?: string;
  /** 最大重試次數 */
  maxRetries?: number;
  /** 重試延遲（毫秒） */
  retryDelay?: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || statusText);
    this.name = 'ApiError';
  }
}

/**
 * 統一 API Client 類別
 */
export class ApiClient {
  private baseURL: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || '/api';
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
  }

  /**
   * 建立請求標頭
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 重試機制
   */
  private async retry<T>(
    fn: () => Promise<Response>,
    retries: number = this.maxRetries
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fn();
        
        // 只有 5xx 錯誤才重試
        if (response.status >= 500 && i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  /**
   * 處理回應
   */
  private async handleResponse<T>(
    response: Response,
    context: { feature: string; action: string }
  ): Promise<T> {
    const handled = await handleApiError(response, context);
    
    if (!handled) {
      throw new ApiError(response.status, response.statusText);
    }

    try {
      const data = await response.json();
      return data.data ?? data;
    } catch {
      // 如果回應不是 JSON，回傳空物件
      return {} as T;
    }
  }

  /**
   * GET 請求
   */
  async get<T>(
    endpoint: string,
    options: { feature: string; action?: string } = { feature: 'api' }
  ): Promise<T> {
    const context = {
      feature: options.feature,
      action: options.action || 'fetch',
    };

    try {
      const response = await this.retry(() =>
        fetch(`${this.baseURL}${endpoint}`, {
          method: 'GET',
          headers: this.getHeaders(),
        })
      );

      return await this.handleResponse<T>(response, context);
    } catch (error) {
      handleError(error, context, {
        customMessage: getDefaultErrorMessage(context.feature, context.action),
      });
      throw error;
    }
  }

  /**
   * POST 請求
   */
  async post<T>(
    endpoint: string,
    body: unknown,
    options: { feature: string; action?: string } = { feature: 'api' }
  ): Promise<T> {
    const context = {
      feature: options.feature,
      action: options.action || 'create',
    };

    try {
      const response = await this.retry(() =>
        fetch(`${this.baseURL}${endpoint}`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(body),
        })
      );

      return await this.handleResponse<T>(response, context);
    } catch (error) {
      handleError(error, context, {
        customMessage: getDefaultErrorMessage(context.feature, context.action),
      });
      throw error;
    }
  }

  /**
   * PUT 請求
   */
  async put<T>(
    endpoint: string,
    body: unknown,
    options: { feature: string; action?: string } = { feature: 'api' }
  ): Promise<T> {
    const context = {
      feature: options.feature,
      action: options.action || 'update',
    };

    try {
      const response = await this.retry(() =>
        fetch(`${this.baseURL}${endpoint}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(body),
        })
      );

      return await this.handleResponse<T>(response, context);
    } catch (error) {
      handleError(error, context, {
        customMessage: getDefaultErrorMessage(context.feature, context.action),
      });
      throw error;
    }
  }

  /**
   * DELETE 請求
   */
  async delete(
    endpoint: string,
    options: { feature: string; action?: string } = { feature: 'api' }
  ): Promise<void> {
    const context = {
      feature: options.feature,
      action: options.action || 'delete',
    };

    try {
      const response = await this.retry(() =>
        fetch(`${this.baseURL}${endpoint}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        })
      );

      await handleApiError(response, context);
    } catch (error) {
      handleError(error, context, {
        customMessage: getDefaultErrorMessage(context.feature, context.action),
      });
      throw error;
    }
  }
}

// 匯出單例實例
export const apiClient = new ApiClient();

