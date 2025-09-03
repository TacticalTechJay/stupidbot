import { ChatInputCommandInteraction, GuildBasedChannel, GuildMember } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';

export default class join extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'join',
      devOnly: false,
    });
  }

  async exec(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;
    const channel = interaction.options.get('channel', false)?.channel as GuildBasedChannel | undefined;
    if (!member.voice?.channelId && !channel)
      return await interaction.reply('Gotta be in a voice channel :3');

    const player =
      this.client.lavalink.getPlayer(interaction.guildId) ??
      this.client.lavalink.createPlayer({
        guildId: interaction.guildId,
        voiceChannelId: channel ? channel.id : member.voice.channelId,
        textChannelId: interaction.channelId,
        selfDeaf: true,
        selfMute: false,
        volume: 100,
      });

    if (player.playing && !player.paused) {
      const intrctRes = await interaction.reply({
        content:
          "Might want to pause those tunes if you want me to swap voice channels ^-^\nIf you're sure, press the button below. .u.",
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                custom_id: `transfer_${channel ? channel.id : member.voice.channelId}`,
                label: 'Confirm',
                style: 4,
              },
            ],
          },
        ],
        withResponse: true,
      });
      await new Promise((r) => setTimeout(r, 15000));
      try {
        await intrctRes.resource.message.delete();
      } catch (e) {
        void e;
      }
      return;
    }

    if (!player.connected) await player.connect();

    if (player.voiceChannelId !== member.voice.channelId && !channel)
      await player.changeVoiceState({ voiceChannelId: member.voice.channelId });
    if (player.textChannelId !== interaction.channelId) player.textChannelId = interaction.channelId;

    return await interaction.reply('Here I am! :3');
  }
}
