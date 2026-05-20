import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
} from 'discord.js';
import { SearchResult } from 'lavalink-client';
import { inspect } from 'bun';
import ButtonCommand from 'structures/ButtonCommand';
import MusicClient from 'structures/MusicClient';

export default class info extends ButtonCommand {
  constructor(client: MusicClient) {
    super(client, 'info');
  }
  // ops: info_{artist|track}_{i in cacheRes as Number}
  async exec(interaction: ButtonInteraction, ops: string[]) {
    const container = new ContainerBuilder().setAccentColor(0x0000ff),
      cacheRes = this.client.cacheRes.get(`${interaction.guildId}-${interaction.user.id}`);

    if (!cacheRes)
      return await interaction.update({
        components: [new TextDisplayBuilder().setContent('Expired content!')],
      });

    const infoSel = cacheRes[ops[0] === 'artist' ? 'artists' : 'tracks'][parseInt(ops[1])];

    let res: SearchResult;
    try {
      res = await this.client.lavalink.nodeManager.getNode(process.env.LAVALINK_ID).search(
        {
          query: infoSel.info.uri || infoSel.pluginInfo.url,
        },
        interaction.member,
      );
    } catch (e) {
      console.error(e);
      return interaction.update({
        components: [new TextDisplayBuilder().setContent('Something went wrong! Sorry :(')],
      });
    }

    if (ops[0] === 'track') {
      const track = res.tracks[0],
        durMins = Math.floor(track.info.duration / 60_000),
        durSecs = ('0' + Math.floor((track.info.duration - durMins * 60_000) / 1_000)).slice(-2);
      container
        .addSectionComponents((sB) =>
          sB
            .addTextDisplayComponents((tB) =>
              tB.setContent(
                `Title: ${track.info.title}\nAuthor: ${track.info.author}\nDuration: ${durMins}:${durSecs}\nURL: ${track.info.uri}`,
              ),
            )
            .setThumbnailAccessory((tB) => tB.setURL(track.info.artworkUrl)),
        )
        .addSeparatorComponents((sp) => sp)
        .addTextDisplayComponents((tB) =>
          tB.setContent(`\n\`\`\`json\n${inspect(track.pluginInfo, { colors: false, depth: 5 })}\n\`\`\``),
        )
        .addActionRowComponents((aRB) =>
          aRB.addComponents(
            new ButtonBuilder()
              .setCustomId(`play_track_${encodeURIComponent(track.info.uri)}`)
              .setEmoji({ name: '▶' })
              .setStyle(ButtonStyle.Success),
          ),
        );
    }

    if (ops[0] === 'artist') {
      const durMin = Math.floor(res.playlist.duration / 60_000),
        durSecs = ('0' + Math.floor((res.playlist.duration - durMin * 60_000) / 1_000)).slice(-2);
      container
        .addSectionComponents((sB) =>
          sB
            .addTextDisplayComponents((tD) =>
              tD.setContent(
                `## ${res.playlist.author}\nDuration: ${durMin}:${durSecs}\nCount: ${res.tracks.length}\nFirst 3:\n${res.tracks
                  .slice(0, 3)
                  .map((t) => '- ' + t.info.title)
                  .join('\n')}`,
              ),
            )
            .setThumbnailAccessory((tB) => tB.setURL(res.playlist.thumbnail)),
        )
        .addActionRowComponents((aRB) =>
          aRB.addComponents(
            new ButtonBuilder()
              .setCustomId(`play_artist_${encodeURIComponent(res.playlist.uri)}`)
              .setEmoji({ name: '▶' })
              .setStyle(ButtonStyle.Success),
          ),
        );
    }

    await interaction.update({
      components: [container],
    });
    return this.client.cacheRes.delete(`${interaction.guildId}-${interaction.user.id}`);
  }
}
