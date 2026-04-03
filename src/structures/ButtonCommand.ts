import MusicClient from './MusicClient';

export default class Command {
  client: MusicClient;
  name: string | null;
  constructor(client, name: string) {
    this.client = client;
    this.name = name;
  }
}
