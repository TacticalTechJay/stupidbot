import { Snowflake, TextChannel } from 'discord.js';
import { Player } from 'lavalink-client/dist/types';
import Event from 'structures/Event';
import MusicClient from 'structures/MusicClient';

export default class playerQueueEmptyEnd extends Event {
  constructor(client: MusicClient) {
    super(client, {
      name: 'playerQueueEmptyEnd',
    });
  }

  async exec(
    p: Player & {
      lastMsgId: Snowflake;
    }
  ) {
    let channel = (this.client.channels.cache.get(p.textChannelId) ??
      (await this.client.channels.fetch(p.textChannelId))) as TextChannel;
    try {
      if (p.lastMsgId) await channel.messages.delete(p.lastMsgId);
    } catch (e) {
      void e;
    }
    return await channel.send('Finished playing, cya!');
  }
}
