import { CommandInteraction } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';

export default class bored extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'bored',
      devOnly: true,
    });
  }

  async exec(interaction: CommandInteraction) {
    const msg = await interaction.reply({
      content: ':V',
      fetchReply: true,
    });
    const interval = setInterval(async () => {
      const msg1 = await interaction.fetchReply(msg.id);
      if (msg1.content === ':V') return await msg1.edit(':I');
      if (msg1.content === ':I') return await msg1.edit(':V');
    }, 2000);
    setTimeout(() => clearInterval(interval), 60_000);
  }
}
