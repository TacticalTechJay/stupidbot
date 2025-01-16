import { ClientEvents } from 'discord.js';
import { LavalinkManagerEvents } from 'lavalink-client/dist/types';
import Client from 'structures/MusicClient';

export default class Event {
  client: Client;
  name: keyof ClientEvents | keyof LavalinkManagerEvents;
  constructor(
    client: Client,
    options: {
      name: keyof ClientEvents | keyof LavalinkManagerEvents
    } = {
      name: null,
    }
  ) {
    this.client = client;
    this.name = options.name || null;
  }
}
