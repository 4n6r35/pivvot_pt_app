export interface Task {
    id: number,
    title: string,
    description: string,
    date?: string,
    date_to_finish: string
}

export interface NewTask {
    title: string,
    description: string,
    date: string,
}

export interface UpdateTask {
    id_task: number,
    title?: string,
    description?: string,
    date?: string,
}

export interface TaskDetail {
    id_task: number,
    title?: string,
    description?: string,
    date?: string,
    state?: boolean,
    createdAt?: string
    updatedAt?:string
}