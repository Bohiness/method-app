export interface ProjectType {
    id: number
    name: string
    color: string
    description?: string
    user?: number
    created_at: string
    updated_at: string
    tasks_count?: number
}

export interface CreateProjectDtoType {
    name: string
    description?: string
    color: string
}

export interface UpdateProjectDtoType extends Partial<CreateProjectDtoType> { }

export interface ProjectFiltersType {
    search?: string
    ordering?: string
}

export interface ProjectSyncOperation {
    type: 'create' | 'update' | 'delete'
    id?: number
    data?: CreateProjectDtoType | UpdateProjectDtoType
    timestamp: number
}