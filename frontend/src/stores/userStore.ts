import { defineStore } from 'pinia';
import { ref } from 'vue';
import socketGateway from '../services/socketGateway';
import type { User } from '../types';

export const useUserStore = defineStore('user', () => {
    // estado
    const currentUser = ref<string>('');
    const connectedUsers = ref<User[]>([]);

    // acciones
    const login = (name: string) => {
        if (!name.trim()) return;
        currentUser.value = name;
        socketGateway.init('http://localhost:3001');
        socketGateway.emit('user:join', { name });
        initListeners();
    };

    const initListeners = () => {
        socketGateway.on('presence:users', (data: { users: User[] }) => {
            connectedUsers.value = data.users;
        });
    };

    return {
        currentUser,
        connectedUsers,
        login
    };
});