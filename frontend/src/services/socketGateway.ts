import { io, Socket } from "socket.io-client";

// se usa patrón singleton para tener una única instancia de conexión
class SocketGateway {
  private socket: Socket | null = null;
  private static instance: SocketGateway;

  // constructor privado para evitar que se instancie
  private constructor() {}

  public static getInstance(): SocketGateway {
    if (!SocketGateway.instance) {
      SocketGateway.instance = new SocketGateway();
    }
    return SocketGateway.instance;
  }

  /**
   * iniciar conexión al servidor
   * @param url 
   */
  public init(url: string): void {
    if (this.socket) {
      console.warn("SocketGateway: La conexión ya estaba inicializada.");
      return;
    }

    this.socket = io(url, {
      transports: ["websocket"], 
      autoConnect: true,
    });

    this.setupBaseListeners();
  }

  /**
   * configuracion de listeners
   */
  private setupBaseListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("conectado al servidor de sockets:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("desconectado del servidor.");
    });

    this.socket.on("server:error", (error: { message: string }) => {
      console.error("error del Servidor:", error.message);
    });
  }

  /**
   * método genérico para emitir datos
   */
  public emit(event: string, payload?: any): void {
    if (!this.socket) {
      console.error("SocketGateway: Intento de emitir sin conexión inicializada.");
      return;
    }
    this.socket.emit(event, payload);
  }

  /**
   * método genérico para escuchar datos
   */
  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.error("SocketGateway: Intento de escuchar sin conexión inicializada.");
      return;
    }
    this.socket.on(event, callback);
  }

  /**
   método para dejar de escuchar datos
   */
  public off(event: string): void {
    if (!this.socket) return;
    this.socket.off(event);
  }

  /**
   * cerrar conexión
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// se exporta la instancia unica siguiendo el patrón singleton
export default SocketGateway.getInstance();