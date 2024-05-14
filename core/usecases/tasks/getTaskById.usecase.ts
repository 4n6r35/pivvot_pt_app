import { HttpAdapter } from "../../../config";
import { TaskResponse } from '../../../interfaces/task.inteface';

export const GetByIdTaskUseCase = async (fetcher: HttpAdapter, id_task: number): Promise<TaskResponse> => {
    try {
        const id: Record<string, unknown> = {
            id_task: id_task,
        }

        const response = await fetcher.post<TaskResponse>('/by-id', id);

        return ({
            ok: response.ok,
            message: response.message,
            task: response.task
        });
    } catch (error) {
        console.error(error);
        throw new Error('Error deleting task');
    }
}
