import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '../stores/userStore';

// mock del socketGateway
vi.mock('../services/socketGateway', () => ({
  default: {
    init: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
  }
}));

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('debe iniciar con un usuario vacío', () => {
    const store = useUserStore();
    expect(store.currentUser).toBe('');
  });

  it('debe actualizar el currentUser al hacer login', () => {
    const store = useUserStore();
    const testName = 'Cristobal';
    
    store.login(testName);
    
    expect(store.currentUser).toBe(testName);
  });
  
  it('no debe permitir login con nombre vacío', () => {
    const store = useUserStore();
    store.login('   ');
    expect(store.currentUser).toBe('');
  });
});