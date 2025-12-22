<script setup lang="ts">
import { useUserStore } from './stores/userStore';
import LoginView from './views/LoginView.vue';
import UserList from './components/common/UserList.vue';
import BoardCanvas from './components/board/BoardCanvas.vue'; 

const userStore = useUserStore();
</script>

<template>
  <main class="w-full h-screen overflow-hidden bg-[#242424] text-white">
    <LoginView v-if="!userStore.currentUser" />

    <div v-else class="relative w-full h-full">
      <UserList />
      
      <BoardCanvas /> 
    </div>
  </main>
</template>