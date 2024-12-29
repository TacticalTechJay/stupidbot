import Event from 'structures/Event';
import MusicClient from 'structures/MusicClient';

export default class raw extends Event {
  constructor(client: MusicClient) {
    super(client, {
      name: 'raw',
    });
  }

  async exec(d) {
    await this.client.lavalink.sendRawData(d);
  }
}
