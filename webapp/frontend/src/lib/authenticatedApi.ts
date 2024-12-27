import type { Topology } from "../../../common/shared-types";

type ApiConfig = {
    baseUrl: string;
    getToken: () => string | null;
};
type ApiError = {
    message: string;
    status?: number;
};
type ApiResponse<T> = {
    message: string;
    data?: T;
}

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
            const data = await response.json();
            return data;
        }

        // handle non JSON responses
        return {
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

    // TODO change how this works - make sure this is also being used by the nav bar component for name saving
    async updateTopology(id: number, data: Partial<Topology>) {
        return this.fetch<Topology>(`/topology/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteTopology(id: number) {
        return this.fetch<{ topologyId: number }>(`/topology/${id}`, {
            method: 'DELETE'
        });
    }
}