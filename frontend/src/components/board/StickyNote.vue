<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useNoteStore } from '../../stores/noteStore';
import type { Note } from '../../types';

const props = defineProps<{ note: Note }>();
const noteStore = useNoteStore();

// --- Estado Local ---
const isDragging = ref(false);
const showComments = ref(false);
const newCommentText = ref('');
const offset = ref({ x: 0, y: 0 });
const localX = ref(props.note.x);
const localY = ref(props.note.y);

// Computed para saber si alguien escribe
const isSomeoneElseTyping = computed(() => {
  const typerName = noteStore.activeTypers[props.note.id];
  return typerName ? typerName : null;
});

// --- Lógica de Arrastre (Drag & Drop Híbrido) ---

// 1. Función auxiliar para normalizar coordenadas y arreglar el error 
const getCoords = (event: MouseEvent | TouchEvent) => {
  if ('touches' in event) {
    // Es un evento Touch
    const touch = event.touches[0];
    if (!touch) return { x: 0, y: 0 }; // Protección contra undefined
    return {
      x: touch.clientX,
      y: touch.clientY
    };
  } else {
    // Es un evento Mouse
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
};

// 2. startDrag acepta ambos tipos de evento
const startDrag = (event: MouseEvent | TouchEvent) => {
  // Evitar arrastre si tocamos botones o inputs
  if ((event.target as HTMLElement).closest('input, textarea, button, .no-drag')) return;

  isDragging.value = true;
  
  const coords = getCoords(event);
  
  offset.value = {
    x: coords.x - localX.value,
    y: coords.y - localY.value
  };

  // 3. CASTING IMPORTANTE: 'as EventListener'
  // Esto soluciona el error "No overload matches this call".
  // Le decimos a TS: "Confía en mí, esta función maneja eventos genéricos".
  window.addEventListener('mousemove', onDrag as EventListener);
  window.addEventListener('touchmove', onDrag as EventListener, { passive: false });
  
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchend', stopDrag);
};

const onDrag = (event: Event) => {
  if (!isDragging.value) return;


  const dragEvent = event as MouseEvent | TouchEvent;


  if ('touches' in dragEvent) {
    dragEvent.preventDefault();
  }

  const coords = getCoords(dragEvent);
  localX.value = coords.x - offset.value.x;
  localY.value = coords.y - offset.value.y;
};

const stopDrag = async () => {
  if (!isDragging.value) return;
  
  // Limpieza usando casting también
  window.removeEventListener('mousemove', onDrag as EventListener);
  window.removeEventListener('touchmove', onDrag as EventListener);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchend', stopDrag);

  // Actualización Optimista
  noteStore.updateNote({
    id: props.note.id,
    x: localX.value,
    y: localY.value
  });
  
  await nextTick();
  isDragging.value = false;
};

// --- Resto de lógica (Edición, Comentarios) ---
const updateContent = (field: 'title' | 'content', value: string) => {
  if (props.note[field] === value) return;
  noteStore.updateNote({ id: props.note.id, [field]: value });
};

const sendComment = () => {
  if (!newCommentText.value.trim()) return;
  noteStore.addComment(props.note.id, newCommentText.value);
  newCommentText.value = '';
};

const onFocus = () => noteStore.setTyping(props.note.id, true);
const onBlur = () => noteStore.setTyping(props.note.id, false);

const stylePosition = computed(() => ({
  transform: `translate(${isDragging.value ? localX.value : props.note.x}px, ${isDragging.value ? localY.value : props.note.y}px)`,
}));

const formatDate = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
</script>

<template>
  <div
    class="sticky-note absolute w-72 bg-yellow-200 rounded-lg shadow-xl flex flex-col transition-shadow hover:shadow-2xl"
    :class="{ 'z-50 ring-2 ring-blue-500 cursor-grabbing': isDragging, 'z-10 cursor-grab': !isDragging }"
    :style="stylePosition"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
      <div class="flex justify-between items-center px-3 py-2 border-b border-yellow-300/50 bg-yellow-300/30 rounded-t-lg">
        <div class="flex items-center gap-1 max-w-[120px]">
          <span v-if="isSomeoneElseTyping" class="text-[10px] font-bold text-blue-600 animate-pulse flex items-center gap-1">
            ✎ {{ isSomeoneElseTyping }}...
          </span>
          
          <span v-else-if="note.updatedBy && note.updatedBy !== 'unknown'" class="text-[10px] text-yellow-800 font-medium truncate opacity-70">
            Editado por: {{ note.updatedBy }}
          </span>
        </div>
      
        <div class="flex items-center gap-2">
          <button 
            @click.stop="showComments = !showComments"
            class="text-yellow-800 hover:text-blue-600 transition flex items-center gap-1 text-xs font-bold px-2 py-1 rounded hover:bg-yellow-400/30"
            title="Ver comentarios"
          >
            💬 {{ note.comments?.length || 0 }}
          </button>
          
          <button 
            @click.stop="noteStore.deleteNote(note.id)"
            class="text-yellow-700 hover:text-red-600 hover:bg-red-100 rounded px-2 transition font-bold"
          >
            ✕
          </button>
      </div>
    </div>

    <div class="p-4 space-y-2 flex-col flex" v-if="!showComments">
      <input
        type="text"
        :value="note.title"
        @change="(e) => updateContent('title', (e.target as HTMLInputElement).value)"
        class="w-full bg-transparent font-bold text-gray-900 placeholder-yellow-600/50 border-none focus:ring-0 focus:border-b focus:border-yellow-600 p-0 text-lg"
        placeholder="Título..."
        @focus="onFocus"
        @blur="onBlur"
      />
      <textarea
        :value="note.content"
        @focus="onFocus"
        @blur="onBlur"
        @change="(e) => updateContent('content', (e.target as HTMLTextAreaElement).value)"
        class="w-full h-24 bg-transparent text-gray-800 placeholder-yellow-600/50 resize-none border-none focus:ring-0 text-sm leading-relaxed no-drag focus:bg-yellow-100/50 rounded"
        placeholder="Escribe una nota..."
      ></textarea>
    </div>

    <div v-else class="p-3 bg-yellow-100/80 rounded-b-lg flex flex-col h-48 no-drag cursor-default">
      <h4 class="text-xs font-bold text-gray-500 uppercase mb-2">Comentarios</h4>
      
      <div class="flex-1 overflow-y-auto space-y-2 mb-2 pr-1 custom-scrollbar">
        <div v-if="note.comments.length === 0" class="text-center text-gray-400 text-xs italic mt-4">
          Sin comentarios aún.
        </div>
        
        <div 
          v-for="comment in note.comments" 
          :key="comment.id" 
          class="bg-white/60 p-2 rounded text-xs"
        >
          <div class="flex justify-between text-[10px] text-gray-500 mb-1">
            <span class="font-bold text-gray-700">{{ comment.user }}</span>
            <span>{{ formatDate(comment.timestamp) }}</span>
          </div>
          <p class="text-gray-800">{{ comment.text }}</p>
        </div>
      </div>

      <div class="flex gap-1 mt-auto">
        <input 
          v-model="newCommentText"
          @keydown.enter="sendComment"
          type="text" 
          placeholder="Comentar..."
          class="flex-1 text-xs px-2 py-1 text-black rounded border border-yellow-300 focus:outline-none focus:border-blue-400 bg-white"
          @focus="onFocus"
          @blur="onBlur"
        />
        <button 
          @click="sendComment"
          class="bg-blue-500 text-white text-xs px-2 rounded hover:bg-blue-600 transition"
        >
          Enviar
        </button>
      </div>
    </div>
  </div>
</template>