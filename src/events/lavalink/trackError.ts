import { TextChannel } from 'discord.js';
import { Player, Track } from 'lavalink-client/dist/types';
import Event from 'structures/Event';

export default class trackError extends Event {
  constructor(client) {
    super(client, {
      name: 'trackError',
    });
  }

  async exec(p: Player, t: Track & { retries: number | string }) {
    let channel = (this.client.channels.cache.get(p.textChannelId) ??
      (await this.client.channels.fetch(p.textChannelId))) as TextChannel;
    t.retries ? (t.retries = parseInt(t.retries as string) + 1) : (t.retries = Number(1));
    if (t.retries > 3)
      return await channel.send(
        `Looks like I've been having problems playing ${t.info.title}... Gonna have to skip over this one after 3 tries, sorry!`
      );

    p.queue.add(t);
    await new Promise((r) => setTimeout(r, 2000));
    return await channel.send(
      `Looks like I'm having problems playing ${t.info.title}... I'll add this back to the end of the queue`
    );
  }
}
