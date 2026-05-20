import { ButtonInteraction } from 'discord.js';
import ButtonCommand from 'structures/ButtonCommand';
import MusicClient from 'structures/MusicClient';

export default class transfer extends ButtonCommand {
  constructor(client: MusicClient) {
    super(client, 'transfer');
  }

  // ops: transfer_{channelId as String}
  async exec(interaction: ButtonInteraction, ops: string[]) {
    const player = this.client.lavalink.getPlayer(interaction.guildId);
    await player.changeVoiceState({
      voiceChannelId: ops[0],
    });
    await interaction.message.delete();
    return await interaction.reply('Done! ^w^');
  }
}
