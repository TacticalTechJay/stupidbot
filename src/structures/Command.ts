import MusicClient from './MusicClient';

export default class Command {
  client: MusicClient;
  name: string | null;
  devOnly: boolean;
  constructor(
    client,
    options = {
      name: null,
      devOnly: false,
    }
  ) {
    this.client = client;
    this.name = options.name || null;
    this.devOnly = options.devOnly || false;
  }
}
