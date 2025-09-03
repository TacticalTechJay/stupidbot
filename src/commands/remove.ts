import { ChatInputCommandInteraction } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';

export default class move extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'remove',
      devOnly: false,
    });
  }

  async exec(interaction: ChatInputCommandInteraction) {
    const player = this.client.lavalink.getPlayer(interaction.guildId);
    if (!player) return await interaction.reply("You can't remove it remove it :(");

    const track = (interaction.options.get('track', true).value as number) - 1;

    if (track + 1 > player.queue.tracks.length)
      return await interaction.reply('There is no track at that point.');
    const rTrack = await player.queue.remove(track);

    return await interaction.reply(`Rmoved ${rTrack.removed[0].info.title} from the queue.`);
  }
}
