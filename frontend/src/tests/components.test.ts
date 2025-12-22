import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LoginView from '../views/LoginView.vue';

describe('LoginView Component', () => {

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renderiza el formulario de ingreso', () => {
    const wrapper = mount(LoginView);
    
    // verificamos elementos clave
    expect(wrapper.find('h1').text()).toBe('Collab Board'); 
    expect(wrapper.find('button').exists()).toBe(true);
  });
});