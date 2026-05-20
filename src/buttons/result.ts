import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
} from 'discord.js';
import ButtonCommand from 'structures/ButtonCommand';
import MusicClient from 'structures/MusicClient';

export default class result extends ButtonCommand {
  constructor(client: MusicClient) {
    super(client, 'result');
  }

  // ops: result_{close|tracks|artists as String}
  async exec(interaction: ButtonInteraction, ops: string[]) {
    const otherThingy = new ContainerBuilder()
        .setAccentColor(0xad74f7)
        .addTextDisplayComponents((tD) => tD.setContent('# Pick your poison.')),
      res = this.client.cacheRes.get(`${interaction.guildId}-${interaction.user.id}`);

    if (!res)
      return await interaction.update({
        components: [new TextDisplayBuilder().setContent('Expired content.')],
      });

    if (ops[0] === 'close') {
      this.client.cacheRes.delete(`${interaction.guildId}-${interaction.user.id}`);
      return await interaction.update({
        components: [new TextDisplayBuilder().setContent('Closed')],
      });
    }

    if (ops[0] === 'tracks')
      for (const t in res.tracks.slice(0, 5)) {
        const tr = res.tracks[t],
          durMins = Math.floor(tr.info.duration / 60_000),
          durSecs = ('0' + Math.floor((tr.info.duration - durMins * 60_000) / 1_000)).slice(-2),
          description = `${tr.info.duration > 0 ? `Duration: ${durMins}:${durSecs} | ` : ''}Author: ${tr.info.author}`;
        otherThingy.addSectionComponents((sB) =>
          sB
            .addTextDisplayComponents((tD) => tD.setContent(`${tr.info.title}\n-# ${description}`))
            .setButtonAccessory((bB) =>
              bB.setStyle(ButtonStyle.Secondary).setCustomId(`info_track_${t}`).setEmoji({ name: 'ℹ️' }),
            ),
        );
      }

    if (ops[0] === 'artists')
      // @ts-ignore won't happen if it never occurs
      for (const a in res.artists.slice(0, 5)) {
        // @ts-ignore
        const ar = res.artists[a];
        otherThingy.addSectionComponents((sB) =>
          sB
            .addTextDisplayComponents((tD) => tD.setContent(`${ar.pluginInfo.author || ar.info.name}`))
            .setThumbnailAccessory((tB) => tB.setURL(ar.pluginInfo.artworkUrl))
            .setButtonAccessory((bB) =>
              bB.setStyle(ButtonStyle.Secondary).setCustomId(`info_artist_${a}`).setEmoji({
                name: 'ℹ️',
              }),
            ),
        );
      }
    otherThingy
      .addSeparatorComponents((sep) => sep)
      .addActionRowComponents((arb) =>
        arb.addComponents([
          new ButtonBuilder()
            .setCustomId('result_tracks')
            .setDisabled(ops[0] === 'tracks')
            .setLabel('🎵')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('result_artists')
            .setDisabled(ops[0] === 'artists')
            .setLabel('🙇')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('result_close').setLabel('❌').setStyle(ButtonStyle.Danger),
        ]),
      );
    return await interaction.update({
      components: [otherThingy],
    });
  }
}
