import { HttpAdapter } from "../../../config";
import { TaskResponse } from '../../../interfaces/task.inteface';
import { NewTask } from '../../entites/task.entity';


export const CreateTaskUseCase = async (fetcher: HttpAdapter, taskData: NewTask): Promise<TaskResponse> => {
    try {
        const requestData: Record<string, unknown> = {
            title: taskData.title,
            description: taskData.description,
            date: taskData.date,
        }

        const response = await fetcher.post<TaskResponse>('/create', requestData);

        return ({
            ok: response.ok,
            message: response.message
        });
    } catch (error) {
        console.error(error);
        throw new Error('Error creating task');
    }
}
