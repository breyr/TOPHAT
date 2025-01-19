import type { CreateConnectionRequestPayload, Device, DeviceType, IconType, PartialAppUser, Topology } from "../../../common/shared-types";

type ApiConfig = {
    baseUrl: string;
    getToken: () => string | null;
};
type ApiError = {
    error: string;
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
            const res: ApiError = {
                error: `Error ${response.status}: ${response.statusText}`,
                status: response.status,
            };

            if (response.status === 401) {
                // maybe trigger a logout or token refresh here
                res.error = 'Your session has expired. Please log in again.';
            }

            throw res;
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
    async getAllUsers() {
        return this.fetch<PartialAppUser[]>('/auth/users/');
    }

    async deleteUser(id: number) {
        return this.fetch<{ message: string, data?: number }>(`/auth/users/${id}`, {
            method: 'DELETE',
        });
    }

    async updateUser(id: number, data: Partial<PartialAppUser>) {
        return this.fetch<{ message: string, data?: number }>(`/auth/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async getUserByEmail(email: string) {
        return this.fetch<{ message?: string, data?: string }>(`/auth/users/email/${email}`);
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

    async createDeviceBulk(data: Partial<Device>[]) {
        return this.fetch<Device[]>('/devices/bulk', {
            method: 'POST',
            body: JSON.stringify(data),
        })
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

    async createOrUpdateConnection(data: CreateConnectionRequestPayload & { id?: number }) {
        const url = data.id ? `/connections/${data.id}` : '/connections';
        const method = data.id ? 'PUT' : 'POST';
        return this.fetch<{ id: number }>(url, {
            method,
            body: JSON.stringify(data),
        });
    }
}