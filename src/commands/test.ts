import { ButtonBuilder, ButtonStyle, CommandInteraction } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';

export default class test extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'test',
      devOnly: true,
    });
  }

  async exec(interaction: CommandInteraction) {
    const prevButton = new ButtonBuilder()
      .setCustomId('prevTest')
      .setEmoji({ name: '◀' })
      .setStyle(ButtonStyle.Primary);

    const nextButton = new ButtonBuilder()
      .setCustomId('nextTest')
      .setEmoji({ name: '▶' })
      .setStyle(ButtonStyle.Primary);

    const msg = await interaction.reply({
      content: 'Test',
      components: [
        {
          type: 1,
          components: [prevButton, nextButton],
        },
      ],
    });
  }
}
