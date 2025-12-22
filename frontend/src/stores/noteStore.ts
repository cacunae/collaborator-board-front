import { defineStore } from 'pinia';
import { ref } from 'vue';
import socketGateway from '../services/socketGateway';
import type { Note, Comment } from '../types';

let listenersInitialized = false;

export const useNoteStore = defineStore('note', () => {

    const notes = ref<Note[]>([]);
    const isSyncing = ref(false); 
    
    const activeTypers = ref<Record<string, string>>({});

    const setTyping = (noteId: string, isTyping: boolean) => {
        socketGateway.emit('note:typing', { noteId, isTyping });
    };
    
    // inicialización del tablero
    const fetchBoard = () => {
        socketGateway.emit('board:init');
        if (!listenersInitialized) {
            setupListeners();
            listenersInitialized = true;
        }
    };

    const createNote = (noteData: { title: string; content: string; x: number; y: number }) => {
        socketGateway.emit('note:create', noteData);
    };

    const updateNote = (noteUpdate: Partial<Note> & { id: string }) => {
        const index = notes.value.findIndex(n => n.id === noteUpdate.id);
        if (index !== -1) {
            notes.value[index] = { ...notes.value[index], ...noteUpdate } as Note;
        }
        isSyncing.value = true;
        socketGateway.emit('note:update', noteUpdate);
    };

    const deleteNote = (id: string) => {
        socketGateway.emit('note:delete', { id });
    };

    const addComment = (noteId: string, text: string) => {
        socketGateway.emit('note:comment', { noteId, text });
    };

    //  listeners (servidor -> cliente) 
    //  integración con sockets (listeners -> store)

    const setupListeners = () => {
        socketGateway.on('board:data', (data: { notes: Note[] }) => {
            notes.value = data.notes;
        });

        // nota creada por otro 
        socketGateway.on('note:created', (note: Note) => {
            notes.value.push(note);
        });

        // nota actualizada por movimiento o edición
        socketGateway.on('note:updated', (updatedNote: Note) => {
            const index = notes.value.findIndex(n => n.id === updatedNote.id);
            if (index !== -1) {
                notes.value[index] = { ...notes.value[index], ...updatedNote };
            }
            isSyncing.value = false;
        });

        // nota eliminada
        socketGateway.on('note:deleted', ({ id }: { id: string }) => {
            notes.value = notes.value.filter(n => n.id !== id);
        });

        // comentario agregado
        socketGateway.on('note:commented', ({ noteId, comment }: { noteId: string, comment: Comment }) => {
            const note = notes.value.find(n => n.id === noteId);
            if (note) {
                note.comments.push(comment);
            }
        });

        // usuario escribiendo
        socketGateway.on('note:typing', ({ noteId, user, isTyping }: { noteId: string, user: string, isTyping: boolean }) => {
        if (isTyping) {
            activeTypers.value[noteId] = user; 
        } else {
            delete activeTypers.value[noteId];
        }
    });
    };

    return {
        notes,
        isSyncing,
        activeTypers,
        fetchBoard,
        createNote,
        updateNote,
        deleteNote,
        addComment,
        setTyping
    };
});