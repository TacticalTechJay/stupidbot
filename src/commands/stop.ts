import { CommandInteraction, GuildMember, Snowflake } from 'discord.js';
import { Player } from 'lavalink-client/dist/types';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
export default class stop extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'stop',
      devOnly: false,
    });
  }

  async exec(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember;
    const player = this.client.lavalink.getPlayer(interaction.guildId) as Player & {
      lastMsgId: Snowflake;
    };

    if (!member.voice?.channelId) return await interaction.reply('Gotta be in a voice channel. :3');
    if (!player) return await interaction.reply("Nothin's playin'");
    if (player?.voiceChannelId !== member.voice?.channelId)
      return await interaction.reply('Wrong voice channel, join mine!');
    try {
      if (player.lastMsgId) await interaction.channel.messages.delete(player.lastMsgId);
    } catch (e) {
      void e;
    }
    await player.destroy();
    return await interaction.reply('Buh bai!');
  }
}
