import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { SearchResult } from 'lavalink-client';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
import { inspect } from 'util';

export default class play extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'play',
      devOnly: false,
    });
  }

  async exec(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;
    if (!member.voice?.channelId) return await interaction.reply('Gotta be in a voice channel :3');
    const player =
      this.client.lavalink.getPlayer(interaction.guildId) ||
      this.client.lavalink.createPlayer({
        guildId: interaction.guildId,
        voiceChannelId: member.voice.channelId,
        textChannelId: interaction.channelId,
        selfDeaf: true,
        selfMute: false,
        volume: 75,
      });

    if (player.voiceChannelId !== member.voice.channelId)
      return await interaction.reply("No, you can't do that.");
    if (!player.connected) await player.connect();

    let res: SearchResult;
    try {
      await interaction.deferReply();
      res = (await player.search(
        {
          query: interaction.options.get('query').value as string,
        },
        interaction.user,
      )) as SearchResult;
    } catch (e) {
      console.error(inspect(e, { colors: true }));
      return await interaction.editReply(
        'Something went wrong! If a link was provided, it may not be currently supported.',
      );
    }

    if (res.loadType == 'playlist') {
      for (const track of res.tracks) {
        await player.queue.add(track);
      }
      if (!player.playing) await player.play();
      return await interaction.editReply(`Loaded playlist ${res.playlist.name} to the queue`);
    }

    if (res.tracks.length > 0) await player.queue.add(res.tracks[0]);
    else {
      if (res.loadType === 'error') {
        await interaction.editReply(
          'Something cataclysmic has happened that prevents me from loading this! Try something else',
        );
        console.log(inspect(res, false, 5, true));
        return;
      }
      return await interaction.editReply("Couldn't find a track... 😦");
    }
    if (!player.playing) {
      await player.play();
      return await interaction.editReply(
        `Now playing [${res.tracks[0].info.title}](${res.tracks[0].info.uri})`,
      );
    }
    return await interaction.editReply(
      `Added [${res.tracks[0].info.title}](${res.tracks[0].info.uri}) to the queue!`,
    );
  }
}
