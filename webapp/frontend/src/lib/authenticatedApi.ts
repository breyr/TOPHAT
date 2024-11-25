import type { ApiResponse, Topology } from "../types/types";
import { ReactFlowJsonObject } from "@xyflow/react";

type ApiConfig = {
    baseUrl: string;
    getToken: () => string | null;
};
type ApiError = {
    message: string;
    status?: number;
};

export class ApiClient {
    private readonly baseUrl: string;
    private readonly getToken: () => string | null;

    constructor(config: ApiConfig) {
        this.baseUrl = config.baseUrl;
        this.getToken = config.getToken;
    }

    private async fetch<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<ApiResponse<T>> {
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options?.headers,
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error: ApiError = {
                message: `Error ${response.status}: ${response.statusText}`,
                status: response.status,
            };

            if (response.status === 401) {
                // maybe trigger a logout or token refresh here
                error.message = 'Your session has expired. Please log in again.';
            }

            throw error;
        }

        // check if response has JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const jsonData = await response.json();
            return {
                success: true,
                message: jsonData.message,
                data: jsonData,
            };
        }

        // handle non JSON responses
        return {
            success: true,
            message: 'Operation completed successfully',
            data: undefined,
        };
    }

    // API Methods go here
    async createTopology(data: Partial<Topology>) {
        return this.fetch<Topology>('/topology/', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async getAllTopologies() {
        return this.fetch<Topology[]>('/topology/');
    }

    async getTopology(id: number) {
        return this.fetch<Topology>(`/topology/${id}`);
    }

    async updateTopology(id: number, data: {
        react_flow_state: ReactFlowJsonObject
        thumbnail: string
    }) {
        return this.fetch<Topology>(`/topology/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteTopology(id: number) {
        // The topology endpoint doesn't return anything on delete - may need to change this
        // Possibly return the id of the record deleted?
        return this.fetch<{ topologyId: number }>(`/topology/${id}`, {
            method: 'DELETE'
        });
    }
}