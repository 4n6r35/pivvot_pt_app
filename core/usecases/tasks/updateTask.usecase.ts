import { HttpAdapter } from "../../../config";
import { TaskResponse } from "../../../interfaces/task.inteface";
import { UpdateTask } from '../../entites/task.entity';

export const UpdateTaskUseCase = async (fetcher: HttpAdapter, updatedTaskData: UpdateTask): Promise<TaskResponse> => {
    try {
        const requestData: Record<string, unknown> = {
            id_task: updatedTaskData.id_task,
            title: updatedTaskData.title,
            description: updatedTaskData.description,
            date: updatedTaskData.date,
        }

        const response = await fetcher.post<TaskResponse>('/update', requestData);

        return ({
            ok: response.ok,
            message: response.message
        });
    } catch (error) {
        console.error(error);
        throw new Error('Error updating task');
    }
}
