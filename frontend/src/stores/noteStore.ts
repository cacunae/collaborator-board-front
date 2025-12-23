import { defineStore } from 'pinia';
import { ref } from 'vue';
import socketGateway from '../services/socketGateway';
import type { Note } from '../types';

export const useNoteStore = defineStore('note', () => {
  const notes = ref<Note[]>([]);
  const activeTypers = ref<Record<string, string>>({});

  // Inicializar listeners
  const initListeners = () => {
    socketGateway.on('board:data', (data: { notes: Note[] }) => {
      console.log("📋 Tablero recibido:", data.notes);
      notes.value = data.notes;
    });

    socketGateway.on('note:created', (newNote: Note) => {
      notes.value.push(newNote);
    });

    socketGateway.on('note:updated', (updatedNote: Note) => {
      const index = notes.value.findIndex((n) => n.id === updatedNote.id);
      if (index !== -1) notes.value[index] = updatedNote;
    });


    socketGateway.on('note:deleted', ({ id }: { id: string }) => {
      notes.value = notes.value.filter((n) => n.id !== id);
    });


    socketGateway.on('note:commented', ({ noteId, comment }: any) => {
      const note = notes.value.find((n) => n.id === noteId);
      if (note) {
        if (!note.comments) note.comments = [];
        note.comments.push(comment);
      }
    });


    socketGateway.on('note:typing', ({ noteId, user, isTyping }: any) => {
      if (isTyping) {
        activeTypers.value[noteId] = user;
      } else {
        delete activeTypers.value[noteId];
      }
    });
  };

  // Acciones
  const fetchBoard = () => {

    initListeners();

    socketGateway.emit('board:init');
  };

  const createNote = (note: Partial<Note>) => {
    socketGateway.emit('note:create', note);
  };

  const updateNote = (note: Partial<Note>) => {
    socketGateway.emit('note:update', note);
  };

  const deleteNote = (id: string) => {

    socketGateway.emit('note:delete', { id });
  };

  const addComment = (noteId: string, text: string) => {
    socketGateway.emit('note:comment', { noteId, text });
  };

  const setTyping = (noteId: string, isTyping: boolean) => {
    socketGateway.emit('note:typing', { noteId, isTyping });
  };

  return {
    notes,
    activeTypers,
    fetchBoard,
    createNote,
    updateNote,
    deleteNote,
    addComment,
    setTyping
  };
});