import Event from 'structures/Event';
import MusicClient from 'structures/MusicClient';

export default class Ready extends Event {
  constructor(client: MusicClient) {
    super(client, {
      name: 'clientReady',
    });
  }

  async exec() {
    console.log('Readying up...');
    try {
      await this.client.lavalink.init({ ...this.client.user });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
    console.log(`Ready as ${this.client.user.tag}`);
  }
}
