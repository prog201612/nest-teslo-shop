import { WebSocketServer } from '@nestjs/websockets';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      // Validar token i recuperar el id de l'usuari
      const token = client.handshake.headers.authorization as string;
      console.log('[ token ] - ', token);
      const payload = this.jwtService.verify(token);
      console.log('[ payload ] - ', payload);

      await this.messagesWsService.registerClient(client, payload.id);
      this.wss.emit(
        'clients-updated',
        this.messagesWsService.getConnectedClientsIds(),
      );
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client desconnectat: ' + client.id);
    this.messagesWsService.removeClient(client);
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClientsIds(),
    );
  }

  @SubscribeMessage('message-from-client')
  handleMessage(client: Socket, payload: NewMessageDto): void {
    console.log('Client ' + client.id + ' envia: ' + payload);
    const name = this.messagesWsService.getClientNameById(client.id);
    this.wss.emit('message-from-server', { id: name, message: payload });
  }
}
