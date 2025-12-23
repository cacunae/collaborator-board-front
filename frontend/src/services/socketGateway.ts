import { io, Socket } from 'socket.io-client';


const BACKEND_URL = 'https://shaina-colacobiotic-kane.ngrok-free.dev'; 

class SocketGateway {
  private socket: Socket | null = null;

  init() {
    if (this.socket) return;

    console.log(` Conectando a Socket.IO en: ${BACKEND_URL}`);

    this.socket = io(BACKEND_URL, {

      transports: ['polling', 'websocket'], 
  
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      extraHeaders: {
        "ngrok-skip-browser-warning": "true"
      }
    });

    // --- Listeners de Diagnóstico ---
    
    this.socket.on("connect", () => {
      console.log("Socket Conectado! ID:", this.socket?.id);
    });

    this.socket.on("connect_error", (err) => {
      console.error("Error de conexión:", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.warn("Desconectado:", reason);
    });
  }

  // Método genérico para enviar eventos
  emit(event: string, payload?: any) {
    if (!this.socket) {
      console.warn("Intentando emitir sin conexión:", event);
      return;
    }
    this.socket.emit(event, payload);
  }

  // Método genérico para escuchar eventos
  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) this.init(); // Auto-iniciar si hace falta
    this.socket?.on(event, callback);
  }

  // Método para dejar de escuchar (limpieza)
  off(event: string) {
    this.socket?.off(event);
  }

  // Obtener ID del socket actual (útil para lógica de "quién soy")
  getId() {
    return this.socket?.id;
  }
}

// Exportamos una instancia única (Singleton)
export default new SocketGateway();