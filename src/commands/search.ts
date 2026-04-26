import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { LavaSearchResponse, LavaSrcSearchPlatformBase, SearchResult } from 'lavalink-client';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
import { inspect } from 'util';

export default class search extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'search',
      devOnly: false,
    });
  }

  async exec(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember,
      source = (interaction.options.get('source')?.value || 'dzsearch') as LavaSrcSearchPlatformBase,
      query = interaction.options.get('query').value as string;

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

    let res: LavaSearchResponse | SearchResult;
    try {
      await interaction.deferReply({ withResponse: true });

      if (source === 'dzsearch')
        res = (await player.lavaSearch(
          {
            query: query,
            source: source,
            types: ['tracks'],
          },
          interaction.user,
        )) as LavaSearchResponse;
      else
        res = (await player.search(
          {
            query: source + ':' + query,
          },
          interaction.member,
        )) as SearchResult;
    } catch (e) {
      console.error(inspect(e, { colors: true }));
      return await interaction.editReply(
        'Something went wrong! If a link was provided, it may not be currently supported.',
      );
    }

    if (res.tracks.length < 1) return await interaction.editReply("Couldn't find a track... 😦");

    const resp = [];
    for (const t of res.tracks) {
      const durMins = Math.floor(t.info.duration / 60_000),
        durSecs = ('0' + Math.floor((t.info.duration - durMins * 60_000) / 1_000)).slice(-2),
        description = `Duration: ${durMins}:${durSecs} | Author: ${t.info.author}`;
      resp.push({
        label: t.info.title.length > 100 ? t.info.title.substring(0, 100) : t.info.title,
        description: description.length > 100 ? description.substring(0, 100) : description,
        value: t.info.uri,
      });
    }
    const msg = await interaction.editReply({
      content: 'Pick your poison',
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'music_search',
              options: resp,
            },
          ],
        },
      ],
    });
    clearTimeout(player.getData('internal_queueempty'));
    player.setData(
      'internal_queueempty',
      setTimeout(() => {
        player.setData('internal_queueempty', undefined);
        if (player.queue.current) {
          return this.client.lavalink.emit('playerQueueEmptyCancel', player);
        }
        this.client.lavalink.emit('playerQueueEmptyEnd', player);
        player.destroy();
      }, 31_000),
    );

    await new Promise((r) => setTimeout(r, 15_000));
    // @ts-ignore
    if (!(await interaction.fetchReply(msg.id))?.components[0]?.components[0]?.disabled) return;
    return await interaction.editReply({
      content: 'Pick your poison',
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'music_searck',
              options: [
                {
                  label: 'Timed out!',
                  value: 'timeout',
                  default: true,
                },
              ],
              disabled: true,
            },
          ],
        },
      ],
    });
  }
}
