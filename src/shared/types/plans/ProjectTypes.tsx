
export interface ProjectType {
    id: number
    name: string
    description?: string
    created_at: string
    updated_at: string
    tasks_count?: number
}

export interface CreateProjectDtoType {
    name: string
    description?: string
}

export interface UpdateProjectDtoType extends Partial<CreateProjectDtoType> { }