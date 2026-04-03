import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { SearchResult, UnresolvedSearchResult } from 'lavalink-client';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';

export default class playfile extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'playfile',
      devOnly: false,
    });
  }

  async exec(interaction: ChatInputCommandInteraction) {
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
        volume: 75,
      });
    const attch = interaction.options.get('attachy', true).attachment;

    if (player.voiceChannelId !== member.voice.channelId)
      return await interaction.reply("No, you can't do that.");
    if (!player.connected) await player.connect();
    let res: SearchResult | UnresolvedSearchResult;
    try {
      await interaction.deferReply();
      res = await player.search(
        {
          query: attch.url,
        },
        interaction.user,
      );
    } catch (e) {
      console.error(e);
      return await interaction.editReply(
        'Looks like something went wrong when loading this file. Try a different type!',
      );
    }
    if (res.tracks.length == 0)
      return await interaction.editReply("This file doesn't seem to be supported... 😦");
    res.tracks[0].info.title = attch.title ?? attch.name;
    await player.queue.add(res.tracks[0]);
    if (!player.playing) {
      await player.play();
      return await interaction.editReply(
        `Now playing [${res.tracks[0].info.title.replace(/[*_`]/gi, (t) => `\\${t}`)}](${res.tracks[0].info.uri})`,
      );
    }
    return await interaction.editReply(
      `Added [${res.tracks[0].info.title.replace(/[*_`]/gi, (t) => `\\${t}`)}](${res.tracks[0].info.uri}) to the queue!`,
    );
  }
}
