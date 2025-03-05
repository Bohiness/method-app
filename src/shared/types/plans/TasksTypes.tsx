// src/shared/types/tasks/TaskTypes.ts


export type TaskPriority = 'none' | 'low' | 'medium' | 'high'
export type TaskStatus = 'completed' | 'pending'

export interface TaskResponseType {
    tasks: TaskType[]
    message: string
}

export interface TaskType {
    id: number
    text: string
    status: TaskStatus
    project?: number
    start_datetime: string
    end_datetime: string
    is_completed: boolean
    priority?: TaskPriority
    created_at: string
    updated_at: string
    subtasks?: SubTaskType[]
}

export interface CreateTaskDtoType extends Omit<TaskType, 'id' | 'created_at' | 'updated_at'> {
}

export interface UpdateTaskDtoType extends Partial<CreateTaskDtoType> {
    is_completed?: boolean
}

export interface TasksFiltersType {
    status?: TaskStatus
    priority?: TaskPriority
    is_completed?: boolean
    project?: number
    ordering?: string
    search?: string
    start_datetime?: string
    end_datetime?: string
}

export interface SubTaskType {
    id: number
    task: number
    text: string
    status: TaskStatus
    is_completed: boolean
    created_at: string
    updated_at: string
}

export interface CreateSubTaskDtoType {
    text: string
    task: number
    status?: TaskStatus
    is_completed?: boolean
}

export interface UpdateSubTaskDtoType extends Partial<CreateSubTaskDtoType> { }
