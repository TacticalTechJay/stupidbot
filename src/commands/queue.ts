import { ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder } from 'discord.js';
import { randomUUID, UUID } from 'node:crypto';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
export default class queue extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'queue',
      devOnly: false,
    });
  }

  async exec(interaction: CommandInteraction) {
    const player = this.client.lavalink.getPlayer(interaction.guildId);
    if (!player || !player.queue.current) return await interaction.reply('The queue is empty!');

    const uuid = randomUUID();
    const buttonClose = new ButtonBuilder()
      .setCustomId('close')
      .setEmoji({ name: '❌' })
      .setStyle(ButtonStyle.Secondary);
    async function doTimeoutThings(client: MusicClient, uuid: UUID) {
      const cache = client.cacheTracks.get(uuid);
      if (!cache) return;
      const msg = await interaction.channel.messages.fetch(cache?.msgId);
      if (!msg) return;
      if (Date.now() - (cache.lastInteract || msg.createdTimestamp) > 300000) {
        client.cacheTracks.delete(uuid);
        return await msg.edit({
          components: [
            {
              type: 1,
              components: [buttonClose],
            },
          ],
        });
      } else
        setTimeout(() => {
          doTimeoutThings(client, uuid);
        }, 60000);
    }
    const embed = new EmbedBuilder({
      footer: {
        text: `Page: 1/${
          player.queue.tracks.length < 1 ? 'None' : Math.ceil(player.queue.tracks.length / 10)
        } | Tracks enqueued: ${player.queue.tracks.length} | ${uuid}`,
      },
      thumbnail: { url: player.queue.current.info.artworkUrl },
      author: {
        icon_url: interaction.user.avatarURL(),
        name: `| ${interaction.guild.name}'s Queue`,
      },
    });
    const playerPos = player.queue.current.info.duration - player.position,
      posMins = Math.floor(playerPos / 60_000),
      posSecs = Math.floor((playerPos - posMins * 60_000) / 1_000),
      tracks = player.queue.tracks?.map((t, i) => {
        const duration = t.info.duration,
          durMins = Math.floor(duration / 60_000),
          durSecs = Math.floor((duration - durMins * 60_000) / 1_000);
        return `**${i + 1}.** [${t.info.title}](${t.info.uri}) by [${t.info.author}](${
          t.pluginInfo.artistUrl
        }) [${durMins}:${(durSecs < 10 ? '0' : '') + durSecs}]`;
      });
    embed.setDescription(
      `Now Playing:\n[${player.queue.current.info.title}](${player.queue.current.info.uri}) by [${
        player.queue.current.info.author
      }](${player.queue.current.pluginInfo.artistUrl}) [${posMins}:${
        (posSecs < 10 ? '0' : '') + posSecs
      } left]\n\nUp next:\n${tracks.length < 1 ? 'No upcoming tracks! :3' : tracks.slice(0, 10).join('\n')}`
    );
    const queueMessage = await interaction.reply({
      withResponse: true,
      embeds: [embed],
      components:
        tracks.length > 10
          ? [
              {
                type: 1,
                components: [
                  new ButtonBuilder()
                    .setCustomId('prev')
                    .setEmoji({ name: '◀' })
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                  new ButtonBuilder()
                    .setCustomId('next')
                    .setEmoji({ name: '▶' })
                    .setStyle(ButtonStyle.Primary),
                  buttonClose,
                ],
              },
            ]
          : [
              {
                type: 1,
                components: [buttonClose],
              },
            ],
    });

    if (tracks.length > 10)
      this.client.cacheTracks.set(uuid, {
        msgId: queueMessage.resource.message.id,
        guildId: interaction.guildId,
        tracks,
      }) && (await doTimeoutThings(this.client, uuid));

    return;
  }
}
