import { CommandInteraction, GuildMember } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
export default class resume extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'resume',
      devOnly: false,
    });
  }

  async exec(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember;
    if (!member.voice?.channelId) return await interaction.reply('Gotta be in a voice channel. :3');
    const player = this.client.lavalink.getPlayer(interaction.guildId);
    if (!player || !player?.queue.current) return await interaction.reply('Nothing is playing!');
    if (player.voiceChannelId !== member.voice.channelId)
      return await interaction.reply('Wrong voice channel, join mine!');
    await player.resume();
    return await interaction.reply("Turnin' up the music 🕺");
  }
}
