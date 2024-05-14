import { HttpAdapter } from "../../../config";
import { ResponseInterface } from "../../../interfaces/task.inteface";
import { Task } from "../../entites";
import { TaskMapper } from "../../mappers";


export const ListTaskUseCase = async (fetcher: HttpAdapter): Promise<Task[] | undefined> => {

    try {

        const tasks = await fetcher.get<ResponseInterface>('/list')

        return tasks.data?.rows.map(result => TaskMapper.TaskResultToEntity(result))

    } catch (error) {
        console.log(error)
        throw new Error('Error fetching task - ListTask')
    }
}