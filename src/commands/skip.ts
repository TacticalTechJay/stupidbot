import { CommandInteraction, GuildMember } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';

export default class skip extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'skip',
      devOnly: false,
    });
  }

  async exec(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember;
    const player = this.client.lavalink.getPlayer(interaction.guildId);

    if (!member.voice?.channelId) return await interaction.reply('Gotta be in a voice channel. :3');
    if (!player) return await interaction.reply("Nothin's playin'");
    if (player?.voiceChannelId !== member.voice.channelId)
      return await interaction.reply('Wrong voice channel, join mine!');

    if (player.queue?.tracks.length > 0) await player.skip();
    else return (await player.destroy()) && (await interaction.reply('Buh bai!'));
    return await interaction.reply('Skipped!');
  }
}
