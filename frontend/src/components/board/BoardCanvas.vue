<script setup lang="ts">
import { onMounted } from 'vue';
import { useNoteStore } from '../../stores/noteStore';
import StickyNote from './StickyNote.vue';

const noteStore = useNoteStore();

onMounted(() => {
  noteStore.fetchBoard();
});

// las notas se crean con doble click
const handleDoubleClick = (e: MouseEvent) => {
  if (e.target !== e.currentTarget) return;

  noteStore.createNote({
    title: 'Nueva Nota',
    content: '',
    x: e.clientX - 128, 
    y: e.clientY - 50  
  });
};
</script>

<template>
  <div 
    class="relative w-full h-full overflow-hidden bg-[#242424] cursor-crosshair"
    @dblclick="handleDoubleClick"
  >
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
      <p class="text-4xl font-bold text-white text-center">
        Doble click para crear una nota<br>
        Arrastra para mover
      </p>
    </div>

    <StickyNote
      v-for="note in noteStore.notes"
      :key="note.id"
      :note="note"
    />
  </div>
</template>