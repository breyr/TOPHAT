import type { AccountType, Device, DeviceType, IconType, Topology } from "../../../common/shared-types";

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
export interface AppUser {
    username: string;
    email: string;
    password: string;
    accountType: AccountType;
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

    // User API Methods
    async registerUserBulk(data: AppUser[]) {
        return this.fetch<AppUser[]>('/auth/register/bulk', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Topology API Methods
    async createTopology(data: Partial<Topology>) {
        return this.fetch<Topology>('/topology/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getAllTopologies() {
        return this.fetch<Topology[]>('/topology/');
    }

    async getTopology(id: number) {
        return this.fetch<Topology>(`/topology/${id}`);
    }

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

    // Device API Methods
    async createDevice(data: Partial<Device>) {
        return this.fetch<Device>('/devices/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getAllDevices() {
        return this.fetch<Device[]>('/devices/');
    }

    async getDeviceById(id: number) {
        return this.fetch<Device>(`/devices/${id}`);
    }

    async updateDevice(id: number, data: Partial<Device>) {
        return this.fetch<Device>(`/devices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteDevice(id: number) {
        return this.fetch<{ deviceId: number }>(`/devices/${id}`, {
            method: 'DELETE'
        });
    }

    async getDevicesByType(deviceType: DeviceType) {
        return this.fetch<Device[]>(`/devices/type/${deviceType}`);
    }

    async getDevicesByIcon(deviceIcon: IconType) {
        return this.fetch<Device[]>(`/devices/icon/${deviceIcon}`);
    }
}