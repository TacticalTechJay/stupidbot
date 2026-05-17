import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder } from 'discord.js';
import { LavaSearchResponse, LavaSrcSearchPlatformBase, SearchResult } from 'lavalink-client';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
import { inspect } from 'util';

export default class info extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'info',
      devOnly: false,
    });
  }

  async exec(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ withResponse: true });
    const otherThingy = new ContainerBuilder()
        .setAccentColor(0xad74f7)
        .addTextDisplayComponents((tD) => tD.setContent('# Pick your poison.')),
      query = interaction.options.get('query').value as string,
      source = (interaction.options.get('source')?.value || 'dzsearch') as LavaSrcSearchPlatformBase;

    let res: LavaSearchResponse | SearchResult;
    try {
      if (source === 'dzsearch')
        res = (await this.client.lavalink.nodeManager.getNode(process.env.LAVALINK_ID).lavaSearch(
          {
            query: query,
            source: source,
            types: ['tracks', 'artists'],
          },
          interaction.user,
          false,
        )) as LavaSearchResponse;
      else
        res = await this.client.lavalink.nodeManager.getNode(process.env.LAVALINK_ID).search(
          {
            query: source + ':' + query,
          },
          interaction.member,
        );
    } catch (e) {
      console.error(inspect(e, false, 2, true));
      return await interaction.editReply(
        'Something cataclysmic has happened that prevents me from fetching info! Try again later.',
      );
    }

    const tr = res.tracks.slice(0, 5);

    this.client.cacheRes.set(`${interaction.guildId}-${interaction.user.id}`, res);

    for (const t in tr) {
      const tra = tr[t],
        durMins = Math.floor(tra.info.duration / 60_000),
        durSecs = ('0' + Math.floor((tra.info.duration - durMins * 60_000) / 1_000)).slice(-2),
        description = `${tra.info.duration > 0 ? `Duration: ${durMins}:${durSecs} | ` : ''}Author: ${tra.info.author}`;
      otherThingy.addSectionComponents((sB) =>
        sB
          .addTextDisplayComponents((tD) => tD.setContent(`${tra.info.title}\n-# ${description}`))
          .setButtonAccessory((bB) =>
            bB.setStyle(ButtonStyle.Secondary).setCustomId(`info_track_${t}`).setEmoji({ name: 'ℹ️' }),
          ),
      );
    }

    otherThingy
      .addSeparatorComponents((sep) => sep)
      .addActionRowComponents((arb) =>
        arb.addComponents([
          new ButtonBuilder()
            .setCustomId('result_tracks')
            .setDisabled(true)
            .setLabel('🎵')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('result_artists')
            // @ts-ignore stinky
            .setDisabled(source !== 'dzsearch' || !res.artists)
            .setLabel('🙇')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('result_close').setLabel('❌').setStyle(ButtonStyle.Danger),
        ]),
      );

    return await interaction.editReply({
      flags: 'IsComponentsV2',
      components: [otherThingy],
    });
  }
}
