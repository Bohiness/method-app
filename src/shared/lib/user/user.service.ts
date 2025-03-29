import { authApiService } from '@shared/api/auth/auth-api.service';
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { UserType } from '@shared/types/user/UserType';
import { storage } from '../storage/storage.service';
class UserService {
    async getUserFromStorage() {
        const user = await storage.get(STORAGE_KEYS.USER.USER_DATA);
        return user;
    }

    async getUserFromServer() {
        const user = await authApiService.checkAuthFromServer();
        return user;
    }

    async setUserToStorage(user: UserType) {
        await storage.set(STORAGE_KEYS.USER.USER_DATA, user);
    }

    async clearUserFromStorage() {
        await storage.remove(STORAGE_KEYS.USER.USER_DATA);
    }
}

export const userService = new UserService();
