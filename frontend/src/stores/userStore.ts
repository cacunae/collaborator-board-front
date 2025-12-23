import { defineStore } from 'pinia';
import { ref } from 'vue';
import socketGateway from '../services/socketGateway';
import type { User } from '../types';


export const useUserStore = defineStore('user', () => {
    // estado
    const currentUser = ref('');
    const connectedUsers = ref<User[]>([]);
    const isLogged = ref(false);
    // acciones

    const initListeners = () => {
        socketGateway.on('presence:users', (data: { users: User[] }) => {
        console.log("Lista de usuarios recibida:", data.users);
        connectedUsers.value = data.users;
        });
    };

    const login = (name: string) => {
        if (!name.trim()) return;
        currentUser.value = name;
        socketGateway.init();
        socketGateway.emit('user:join', { name });
        initListeners();
    };

    return {
        currentUser,
        connectedUsers,
        login
    };
});