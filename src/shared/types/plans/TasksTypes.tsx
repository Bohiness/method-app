// src/shared/types/tasks/TaskTypes.ts

import { ProjectType } from './ProjectTypes'

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'completed' | 'pending'

export interface TaskType {
    id: number
    text: string
    status: TaskStatus
    project?: ProjectType | null
    start_date: string
    end_date: string
    is_completed: boolean
    priority: TaskPriority
    created_at: string
    updated_at: string
}

export interface CreateTaskDtoType {
    text: string
    project?: number
    start_date: string
    end_date: string
    priority: TaskPriority
    status?: TaskStatus
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
}