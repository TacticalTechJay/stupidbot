import { ButtonInteraction, GuildMember, TextDisplayBuilder } from 'discord.js';
import { LavaSearchResponse, SearchResult } from 'lavalink-client';
import ButtonCommand from 'structures/ButtonCommand';
import MusicClient from 'structures/MusicClient';

export default class play extends ButtonCommand {
  constructor(client: MusicClient) {
    super(client, 'play');
  }

  async exec(interaction: ButtonInteraction, ops: string[]) {
    const member = interaction.member as GuildMember,
      cacheRes = this.client.cacheRes.get(`${interaction.guildId}-${interaction.user.id}`);

    if (Date.now() - interaction.message.createdTimestamp > 30_000 || !member.voice?.channelId)
      return (
        (await interaction.message.delete()) &&
        (await interaction.followUp("You're not in a voice channel...")) &&
        this.client.cacheRes.delete(`${interaction.guildId}-${interaction.user.id}`)
      );
    if (!cacheRes)
      return await interaction.update({
        components: [new TextDisplayBuilder().setContent('Expired content!')],
      });

    const player =
        this.client.lavalink.getPlayer(interaction.guildId) ||
        this.client.lavalink.createPlayer({
          guildId: interaction.guildId,
          voiceChannelId: member.voice.channelId,
          textChannelId: interaction.channelId,
          selfDeaf: true,
          selfMute: false,
          volume: 75,
        }),
      playSel =
        ops[0] === 'artist'
          ? (cacheRes as LavaSearchResponse).artists[parseInt(ops[1])]
          : cacheRes.tracks[parseInt(ops[1])];

    if (!player.connected) await player.connect();

    let res: SearchResult;
    try {
      res = (await player.search(
        {
          query: playSel.info.uri || playSel.pluginInfo.url,
        },
        member,
      )) as SearchResult;
    } catch (e) {
      void e;
    }
    if (res.tracks.length === 0) return await interaction.followUp('No tracks found.');
    if (res.loadType === 'error')
      return await interaction.followUp('Something awful happened while attempting this. Try again later.');
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
              ? `Now playing ${res.playlist.title}. ${res.tracks.length} have been added to the queue.`
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
