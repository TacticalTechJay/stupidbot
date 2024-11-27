import { CommandInteraction } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
export default class queue extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'queue',
      devOnly: false,
    });
  }

  async exec(interaction: CommandInteraction) {
    const player = this.client.lavalink.getPlayer(interaction.guildId);
    if (!player || player.queue.tracks.length < 1) return await interaction.reply('The queue is empty!');
    if (player.queue.tracks.length > 10)
      return await interaction.reply(
        `Your queue's too long and I haven't coded in fancy pages yet. Gl on figuring out what's coming up. I'll give you a hint tho, there are ${player.queue.tracks.length} songs in the queue.`
      );
    return await interaction.reply(
      player.queue.tracks.map((x, i) => `${++i} - ${x.info.title} by ${x.info.author}`).join('\n')
    );
  }
}
