import Event from 'structures/Event';
import MusicClient from 'structures/MusicClient';

export default class Ready extends Event {
  constructor(client: MusicClient) {
    super(client, {
      name: 'ready',
    });
  }

  async exec() {
    await this.client.lavalink.init({ ...this.client.user });
    console.log(`Ready as ${this.client.user.tag}`);
  }
}
