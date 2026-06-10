import { ButtonInteraction, GuildMember, TextDisplayBuilder } from 'discord.js';
import { SearchResult } from 'lavalink-client';
import ButtonCommand from 'structures/ButtonCommand';
import MusicClient from 'structures/MusicClient';

export default class play extends ButtonCommand {
  constructor(client: MusicClient) {
    super(client, 'play');
  }
  // ops: play_{artist|track as String}_{encodeURIComponent(url) as String}
  async exec(interaction: ButtonInteraction, ops: string[]) {
    const member = interaction.member as GuildMember;

    if (Date.now() - interaction.message.createdTimestamp > 30_000) {
      await interaction.message.delete();
      await interaction.reply('This content has expired!');
      return;
    }
    if (!member.voice?.channelId) {
      await interaction.message.delete();
      await interaction.reply("You're not in a voice channel...");
      return;
    }

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

    if (!player.connected) await player.connect();

    let res: SearchResult;
    try {
      res = (await player.lavaSearch(
        {
          query: decodeURIComponent(ops[1]),
          source: 'dzsearch',
        },
        member,
      )) as SearchResult;
    } catch (e) {
      void e;
    }
    if (res.tracks.length === 0) return await interaction.reply('No tracks found.');
    if (ops[0] === 'artist')
      for (const tr of res.tracks) {
        await player.queue.add(tr);
      }

    if (ops[0] === 'track') await player.queue.add(res.tracks[0]);
    if (!player.playing && !player.paused) {
      player.play();
      return await interaction.update({
        components: [
          new TextDisplayBuilder().setContent(
            ops[0] === 'artist'
              ? `Now playing ${res.playlist.name}. ${res.tracks.length} have been added to the queue.`
              : `Now playing ${[res.tracks[0].info.title]} by ${res.tracks[0].info.author}.`,
          ),
        ],
      });
    }
    return await interaction.update({
      components: [
        new TextDisplayBuilder().setContent(
          `Added ${[res.tracks[0].info.title]} ${res.tracks[0].info.author} to the queue!`,
        ),
      ],
    });
  }
}
