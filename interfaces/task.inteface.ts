export interface ResponseInterface {
    ok: boolean;
    message: string;
    data?: Data;
}

export interface Data {
    total_tasks: number;
    rows: Tasks[];
}

export interface Tasks {
    id_task: number;
    title: string;
    description: string;
    date: Date;
    state: boolean;
    createdAt?: Date;
    updatedAt: Date;
}

export interface TaskResponse {
    ok: boolean;
    message: string;
    data?: Tasks;
    task?: Tasks
}
