import { CommandInteraction, GuildMember } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';

export default class join extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'join',
      devOnly: false,
    });
  }

  async exec(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember;
    if (!member.voice?.channelId) return await interaction.reply('Gotta be in a voice channel :3');
    const player =
      this.client.lavalink.getPlayer(interaction.guildId) ??
      this.client.lavalink.createPlayer({
        guildId: interaction.guildId,
        voiceChannelId: member.voice.channelId,
        textChannelId: interaction.channelId,
        selfDeaf: true,
        selfMute: false,
        volume: 100,
      });

    if (player.playing && !player.paused)
      return await interaction.reply(
        'Might want to pause those tunes if you want me to swap voice channels ^-^'
      );

    if (!player.connected) await player.connect();

    if (player.voiceChannelId !== member.voice.channelId)
      await player.changeVoiceState({ voiceChannelId: member.voice.channelId });
    if (player.textChannelId !== interaction.channelId) player.textChannelId = interaction.channelId;

    return await interaction.reply('Here I am! :3');
  }
}
