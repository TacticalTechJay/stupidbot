import { Attachment, CommandInteraction, GuildMember } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
export default class prank extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'prank',
      devOnly: false,
    });
  }

  async exec(interaction: CommandInteraction) {
    const attch = interaction.options.get('attachy').attachment;
    const user = interaction.options.get('prankee').member as GuildMember;

    if (!!this.client.prankster.get(user.id))
      return await interaction.reply({ content: "There's already something queued up", flags: 'Ephemeral' });

    if (user.id === this.client.user.id)
      return await interaction.reply({ content: 'How about I prank you instead?', flags: 'Ephemeral' });

    if (user.user.bot)
      return await interaction.reply({ content: "Useless, don't pick them.", flags: 'Ephemeral' });

    if (!attch.contentType?.match(/^(video|audio)\//i))
      return await interaction.reply({
        content: "This ain't quite the right type of file I was expecting. Pick another.",
        flags: 'Ephemeral',
      });

    this.client.prankster.set(user.id, {
      url: attch.url,
      prankee: user.id,
      prankster: interaction.user.id,
      textchannel: interaction.channelId,
    });

    return await interaction.reply({ content: "Now wait, it'll happen in due time.", flags: 'Ephemeral' });
  }
}
