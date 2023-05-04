import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

interface ConnectedClients {
  [id: string]: {
    client: Socket;
    user: User;
  };
}

@Injectable()
export class MessagesWsService {
  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, userId: string) {
    // Recuperar les dades de l'usuari
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('Usuari no trobat');
    if (!user.isActive) throw new Error('Usuari no actiu');
    console.log('[ user ] - ', user);

    if (userId in this.connectedClients)
      this.connectedClients[userId].client.disconnect();
    this.connectedClients[userId] = { client, user };
    console.log('Clients connectats: ' + this.getConnectedClientsCount());
  }

  removeClient(client: Socket) {
    delete this.connectedClients[client.id];
    console.log('Clients connectats: ' + this.getConnectedClientsCount());
  }

  private getConnectedClientsCount(): number {
    return Object.keys(this.connectedClients).length;
  }

  getConnectedClientsIds(): string[] {
    return Object.keys(this.connectedClients);
  }

  getClientNameById(clientId: string): string {
    for (const key in this.connectedClients) {
      if (this.connectedClients[key].client.id === clientId)
        return this.connectedClients[key].user.fullName;
    }
  }
}
