// src/shared/api/files/files-api.service.ts
import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/system/api-routes';

interface FileUploadResponse {
    file_url: string;
}

class FilesApiService {
    /**
     * Загрузка файла на сервер
     * @param formData - FormData с файлом
     */
    async uploadFile(formData: FormData): Promise<FileUploadResponse> {
        try {
            const response = await apiClient.post<FileUploadResponse>(API_ROUTES.FILES.UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }
}

export const filesApiService = new FilesApiService();
