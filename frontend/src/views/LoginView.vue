<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/userStore';

const name = ref('');
const userStore = useUserStore();

const handleSubmit = () => {
  if (!name.value.trim()) return;
  userStore.login(name.value);
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-[#242424]">
    
    <div class="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
      
      <h1 class="mb-6 text-2xl font-bold text-center text-white">
        Collab Board
      </h1>
      
      <p class="mb-6 text-center text-gray-300">
        Ingresa tu nombre para unirte a la sesión.
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-300">
            Tu Nombre
          </label>
          
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Ej: Ana, Carlos..."
            class="w-full px-4 py-2 mt-1 bg-gray-700 text-white border border-gray-600 rounded-md 
                   placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   outline-none transition"
            required
            autofocus
          />
        </div>

        <button
          type="submit"
          class="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          :disabled="!name.trim()"
        >
          Entrar al Tablero
        </button>
      </form>
    </div>
  </div>
</template>