import Client from 'structures/MusicClient';

export default class Event {
  client: Client;
  name: string | null;
  constructor(
    client: Client,
    options = {
      name: null,
    }
  ) {
    this.client = client;
    this.name = options.name || null;
  }
}
