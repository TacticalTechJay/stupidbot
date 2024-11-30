import { CommandInteraction, GuildMember } from 'discord.js';
import { DestroyReasons } from 'lavalink-client/dist/types';
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

  async exec(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember;
    const source = (interaction.options.get('source')?.value || 'spsearch:') as string;
    const query = interaction.options.get('query').value as string;

    if (!member.voice?.channelId) return await interaction.reply('Gotta be in a voice channel :3');
    const player =
      this.client.lavalink.getPlayer(interaction.guildId) ??
      this.client.lavalink.createPlayer({
        guildId: interaction.guildId,
        voiceChannelId: member.voice.channelId,
        textChannelId: interaction.channelId,
        selfDeaf: true,
        selfMute: false,
        volume: 100,
      });
    if (player.voiceChannelId !== member.voice.channelId)
      return await interaction.reply("No, you can't do that.");
    if (!player.connected) await player.connect();
    if (player.get('internal_queueempty')) {
      clearTimeout(player.get('internal_queueempty'));
      player.set('internal_queueempty', undefined);
    }

    let res;
    try {
      await interaction.deferReply({ fetchReply: true });

      res = await player.search(
        {
          query: source + query,
        },
        interaction.user
      );
    } catch (e) {
      console.error(inspect(e, { colors: true }));
      return await interaction.editReply(
        'Something went wrong! If a link was provided, it may not be currently supported.'
      );
    }

    if (res.loadType === 'error')
      return await interaction.editReply(
        'Something cataclysmic has happened that prevents me from searching! Try something else'
      );
    if (res.tracks < 1) return await interaction.editReply("Couldn't find a track... 😦");

    let resp = [];
    for (const t of res.tracks) {
      const durMins = Math.floor(t.info.duration / 60_000),
        durSecs = Math.floor((t.info.duration - durMins * 60_000) / 1_000),
        description = `Duration: ${durMins}:${durSecs} | Author: ${t.info.author}`;
      resp.push({
        label: t.info.title,
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

    player.set(
      'internal_queueempty',
      setTimeout(() => {
        player.set('internal_queueempty', undefined);
        if (player.queue.current) {
          return this.client.lavalink.emit('playerQueueEmptyCancel', player);
        }
        this.client.lavalink.emit('playerQueueEmptyEnd', player);
        player.destroy();
      }, 31_000)
    );

    await new Promise((r) => setTimeout(r, 30_000));
    if ((await interaction.fetchReply(msg.id)).components[0].components[0].disabled) return;
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
