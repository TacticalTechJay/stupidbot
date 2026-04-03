import { TextChannel } from 'discord.js';
import { Player, Track } from 'lavalink-client';
import Event from 'structures/Event';

export default class trackError extends Event {
  constructor(client) {
    super(client, {
      name: 'trackError',
    });
  }

  async exec(p: Player, t: Track & { retries: number | string }) {
    const channel = (this.client.channels.cache.get(p.textChannelId) ??
      (await this.client.channels.fetch(p.textChannelId))) as TextChannel;
    if (t.retries) t.retries = parseInt(t.retries as string);
    else t.retries = Number(1);
    if (t.retries > 3)
      return await channel.send(
        `Looks like I've been having problems playing ${t.info.title}... Gonna have to skip over this one after 3 tries, sorry!`,
      );

    await channel.send(
      `Looks like I'm having problems playing ${t.info.title}... I'll add this back to the end of the queue`,
    );
    await new Promise((r) => setTimeout(r, 2000));
    p.queue.add(t);
  }
}
