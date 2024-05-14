import { AxiosAdapter } from "./adapters";


export const TaskAdapterFetcher = new AxiosAdapter({
    baseUrl: 'http://192.168.1.105:4500/api/task',
    params:{}
})