import type { CreateConnectionRequestPayload, DeviceType, IconType, LinkRequest, LinkResponse, PartialAppUser, Topology } from "../../../common/src/index";
import { Connection } from "../models/Connection";
import { Device } from "../models/Device";

type ApiConfig = {
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
    private readonly getToken: () => string | null;

    constructor(config: ApiConfig) {
        this.getToken = config.getToken;
    }

    private async fetch<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<ApiResponse<T>> {
        let token = this.getToken();

        // wait for the token to be available
        while (!token) {
            await new Promise(resolve => setTimeout(resolve, 100));
            token = this.getToken();
        }

        const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options?.headers,
        }

        const response = await fetch(endpoint, {
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
        return this.fetch<PartialAppUser[]>('/api/auth/users/');
    }

    async deleteUser(id: number) {
        return this.fetch<{ message: string, data?: number }>(`/api/auth/users/${id}`, {
            method: 'DELETE',
        });
    }


    async updatePassword(data: { userId: number | undefined, oldPassword?: string, newPassword: string }) {
        return this.fetch<{ message: string, success: boolean }>('/api/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    }

    async updateUser(id: number, data: Partial<PartialAppUser>) {
        return this.fetch<{ message: string, data?: number, success: boolean }>(`/api/auth/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async getUserByEmail(email: string) {
        return this.fetch<{ message?: string, data?: string }>(`/api/auth/users/email/${email}`);
    }

    // Topology API Methods
    async createTopology(data: Partial<Topology>) {
        return this.fetch<Topology>('/api/topology/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getAllTopologies() {
        return this.fetch<Topology[]>('/api/topology/');
    }

    async getTopology(id: number) {
        return this.fetch<Topology>(`/api/topology/${id}`);
    }

    async updateTopology(id: number, data: Partial<Topology>) {
        return this.fetch<Topology>(`/api/topology/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteTopology(id: number) {
        return this.fetch<{ topologyId: number }>(`/api/topology/${id}`, {
            method: 'DELETE'
        });
    }

    // Device API Methods
    async createDevice(data: Partial<Device>) {
        return this.fetch<Device>('/api/devices/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getAllDevices() {
        return this.fetch<Device[]>('/api/devices/');
    }

    async getDeviceById(id: number) {
        return this.fetch<Device>(`/api/devices/${id}`);
    }

    async updateDevice(id: number, data: Partial<Device>) {
        return this.fetch<Device>(`/api/devices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteDevice(id: number) {
        return this.fetch<{ deviceId: number }>(`/api/devices/${id}`, {
            method: 'DELETE'
        });
    }

    async getDevicesByType(deviceType: DeviceType) {
        return this.fetch<Device[]>(`/api/devices/type/${deviceType}`);
    }

    async getDevicesByIcon(deviceIcon: IconType) {
        return this.fetch<Device[]>(`/api/devices/icon/${deviceIcon}`);
    }

    // Connection API Methods
    async getAllConnections() {
        return this.fetch<Connection[]>('/api/connections/');
    }

    async getConnectionsByDeviceName(deviceName: string) {
        return this.fetch<Connection[]>(`/api/connections/labDeviceName/${deviceName}`);
    }

    async createConnectionBulk(data: CreateConnectionRequestPayload[]) {
        return this.fetch<Connection[]>('/api/connections/create/bulk', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }

    async deleteConnectionBulk(data: Connection[]) {
        return this.fetch<{ count: number }>('/api/connections/delete/bulk', {
            method: 'DELETE',
            body: JSON.stringify(data)
        })
    }

    async updateConnection(id: number, data: Partial<Connection>) {
        return this.fetch<Connection>(`/api/connections/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    }

    async updateConnectionBulk(data: Connection[]) {
        return this.fetch<Connection[]>('/api/connections/update/bulk', {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    }

    // AppConfig API Methods - consist of key value pairs
    async setAppConfig(key: string, data: string) {
        return this.fetch<{ key: string, value: string }>(`/api/config/${key}`, {
            method: 'PUT',
            body: JSON.stringify({ value: data })
        })
    }

    // Interconnect API Methods
    async createLink(data: LinkRequest) {
        return this.fetch<LinkResponse>(`/interconnect/create_link`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }

    async clearLink(data: LinkRequest) {
        return this.fetch<LinkResponse>(`/interconnect/clear_link`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }
}