import axios, { AxiosInstance } from "axios";
import { HttpAdapter } from "./http.adapter";

interface Options {
    baseUrl: string;
    params: Record<string, string>
}

export class AxiosAdapter implements HttpAdapter {

    private axiosInstance: AxiosInstance;

    constructor(options: Options) {
        this.axiosInstance = axios.create({
            baseURL: options.baseUrl,
            params: options.params,
            headers: { 'Content-Type': 'application/json' }
        })
    }
    async post<T>(url: string, data: Record<string, unknown>, options?: Record<string, unknown>): Promise<T> {
        try {
            const response = await this.axiosInstance.post(url, data, options);
            return response.data;
        } catch (error) {
            console.error(error);
            throw new Error(`Error posting to: ${url}`);
        }
    }

    async get<T>(url: string, options?: Record<string, unknown>): Promise<T> {
        try {

            const { data } = await this.axiosInstance.get(url, options)
            return data

        } catch (error) {
            console.log(error)
            throw new Error(`Error fetching get: ${url}`)
        }
    }

}