import Client from 'structures/MusicClient';

export default class Event {
  client: Client;
  name: string;
  constructor(
    client: Client,
    options: {
      name: string;
    } = {
      name: null,
    },
  ) {
    this.client = client;
    this.name = options.name || null;
  }
}
