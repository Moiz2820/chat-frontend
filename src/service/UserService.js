import apiClient from '@/http';

class UserService {
    async fetchUsers() {
        try {
            const response = await apiClient.get('/users');
            return response.data;
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    }

    async addUser(user) {
        try {
            const response = await apiClient.post('/user/store/',user);
            console.log(response)
            return response.data;
        } catch (error) {
            console.log('Api error', error);
            throw error.response.data;
        }
    }

    async getUser(userId){
      try {
        const response = await apiClient.get('/user/'+userId);
        return response;
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
    }

    async updateUser(user) {
        try {
            const response = await apiClient.post('/user/update/'+user.id, user);
            return response.data;
        } catch (error) {
            console.log('Api error', error);
            throw error;
        }
    }

    async deleteUser(user) {
        try {
            const response = await apiClient.get('/user/delete/'+user);
            return response.data;
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    }
}

export default new UserService();
