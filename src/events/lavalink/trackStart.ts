import { Snowflake, TextChannel } from 'discord.js';
import { Player, Track } from 'lavalink-client/dist/types';
import Event from 'structures/Event';
import MusicClient from 'structures/MusicClient';

export default class trackStart extends Event {
  constructor(client: MusicClient) {
    super(client, {
      name: 'trackStart',
    });
  }

  async exec(p: Player & { lastMsgId: Snowflake }, t: Track) {
    let channel = (this.client.channels.cache.get(p.textChannelId) ??
      (await this.client.channels.fetch(p.textChannelId))) as TextChannel;
    if (!p.lastMsgId)
      return (p.lastMsgId = (await channel.send(`Now playing ${t.info.title} by ${t.info.author}`)).id);
    try {
      await channel.messages.delete(p.lastMsgId);
    } catch (e) {
      void e;
    }
    return (p.lastMsgId = (await channel.send(`Now playing ${t.info.title} by ${t.info.author}`)).id);
  }
}
