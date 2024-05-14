import moment from "moment";
import { Tasks } from "../../interfaces/task.inteface";
import { Task } from "../entites";

export class TaskMapper {
    static TaskResultToEntity(result: Tasks): Task {
        return {
            id: result.id_task,
            title: result.title,
            description: result.description,
            date: moment(result.createdAt).format("DD-MM-YYYY"),
            date_to_finish: moment(result.date).format("DD-MM-YYYY") 
        }
    }
}