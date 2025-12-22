<script setup lang="ts">
import { useUserStore } from '../../stores/userStore';

const userStore = useUserStore();
</script>

<template>
  <div class="fixed top-4 right-4 z-50 pointer-events-none">
    <div class="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200 pointer-events-auto min-w-[220px]">
      
      <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Online ({{ userStore.connectedUsers.length }})
      </h3>
      
      <ul class="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        <li 
          v-for="user in userStore.connectedUsers" 
          :key="user.id"
          class="flex items-center"
        >
          <div class="w-8 h-8 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm mr-3">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>

          <span class="text-gray-700 font-medium truncate">
            {{ user.name }} 
            <span v-if="user.name === userStore.currentUser" class="text-gray-400 text-xs font-normal ml-1">(Tú)</span>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>