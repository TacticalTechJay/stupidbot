import { ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from 'discord.js';
import ButtonCommand from 'structures/ButtonCommand';
import MusicClient from 'structures/MusicClient';

export default class queue extends ButtonCommand {
  constructor(client: MusicClient) {
    super(client, 'queue');
  }

  async exec(interaction: ButtonInteraction, ops: string[]) {
    const player = this.client.lavalink.getPlayer(interaction.guildId);
    const buttonClose = new ButtonBuilder()
      .setCustomId('queue_close')
      .setEmoji({ name: '❌' })
      .setStyle(ButtonStyle.Secondary);
    if (ops[0] === 'close')
      return (await interaction.message.delete()) && this.client.cacheTracks.delete(interaction.message.id);
    if (!player || !player.queue.current)
      return await interaction.update({ components: [{ type: 1, components: [buttonClose] }] });

    const page = interaction.message.embeds[0].footer.text
        .split(' | ')[0]
        .split(' ')[1]
        .split('/')
        .map((n) => parseInt(n)),
      cache = this.client.cacheTracks.get(interaction.message.id);
    if (!cache) return await interaction.update({ components: [{ type: 1, components: [buttonClose] }] });
    const { info, pluginInfo } = player.queue.current,
      playerPos = info.duration - player.position,
      posMins = Math.floor(playerPos / 60_000),
      posSecs = Math.floor((playerPos - posMins * 60_000) / 1_000),
      npText = `Now Playing${(player.repeatMode === 'track' && ' (🔂) ') || ''}:\n[${info.title}](${
        info.uri
      }) by [${info.author}](${pluginInfo.artistUrl}) [${posMins}:${
        (posSecs < 10 ? '0' : '') + posSecs
      } left]`,
      embed = new EmbedBuilder(interaction.message.embeds[0]).setThumbnail(info.artworkUrl),
      // @ts-ignore
      buttonPrev = new ButtonBuilder(interaction.message.components[0].components[0].data),
      // @ts-ignore
      buttonNext = new ButtonBuilder(interaction.message.components[0].components[1].data);

    this.client.cacheTracks.set(interaction.message.id, { ...cache, lastInteract: Date.now() });

    if (ops[0] === 'next') {
      const trackSel = cache.tracks.slice(page[0] * 10, 10 + page[0] * 10);
      embed
        .setFooter({
          text: `Page: ${page[0] + 1}/${page[1]} | Tracks: ${cache.tracks.length} | ${cache.msgId}`,
        })
        .setDescription(
          `${npText}\n\nUp next${(player.repeatMode === 'queue' && ' (🔁) ') || ''}:\n${
            trackSel.length < 1 ? 'No upcoming tracks! :3' : trackSel.join('\n')
          }`,
        );
      if (page[0] + 1 > 1) buttonPrev.setDisabled(false);
      if (page[0] + 1 == page[1]) buttonNext.setDisabled(true);
      return await interaction.update({
        embeds: [embed],
        components: [{ type: 1, components: [buttonPrev, buttonNext, buttonClose] }],
      });
    }
    if (ops[0] === 'prev') {
      const trackSel = cache.tracks.slice((page[0] - 2) * 10, 10 + (page[0] - 2) * 10);
      embed
        .setFooter({
          text: `Page: ${page[0] - 1}/${page[1]} | Tracks: ${cache.tracks.length} | ${cache.msgId}`,
        })
        .setDescription(
          `${npText}\n\nUp next${(player.repeatMode === 'queue' && ' (🔁) ') || ''}:\n${
            trackSel.length < 1 ? 'No upcoming tracks! :3' : trackSel.join('\n')
          }`,
        );
      if (page[0] - 1 == 1) buttonPrev.setDisabled(true);
      if (page[0] - 1 < page[1]) buttonNext.setDisabled(false);
      return await interaction.update({
        embeds: [embed],
        components: [{ type: 1, components: [buttonPrev, buttonNext, buttonClose] }],
      });
    }
  }
}
