import { CommandInteraction, GuildMember } from 'discord.js';
import { RepeatMode } from 'lavalink-client/dist/types';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
export default class loop extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'loop',
      devOnly: false,
    });
  }

  async exec(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember;
    const type = interaction.options.get('type').value as RepeatMode;
    const player = this.client.lavalink.getPlayer(interaction.guildId);

    if (!member.voice.channelId) return await interaction.reply('Gotta be in a voice channel. :3');
    if (!player || !player?.queue.current) return await interaction.reply('Nothing is playing!');
    if (player?.voiceChannelId !== member.voice?.channelId)
      return await interaction.reply('Wrong voice channel, join mine!');
    await player.setRepeatMode(type);
    return await interaction.reply(type !== 'off' ? `Now looping by ${type}` : 'Looping is off!');
  }
}
