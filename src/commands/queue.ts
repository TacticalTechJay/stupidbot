import { ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder } from 'discord.js';
import { randomUUID } from 'node:crypto';
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

    const buttonNext = new ButtonBuilder()
      .setCustomId('next')
      .setEmoji({ name: '▶' })
      .setStyle(ButtonStyle.Primary);

    const buttonPrev = new ButtonBuilder()
      .setCustomId('prev')
      .setEmoji({ name: '◀' })
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const playerPos = player.queue.current.info.duration - player.position,
      posMins = Math.floor(playerPos / 60_000),
      posSecs = Math.floor((playerPos - posMins * 60_000) / 1_000);

    const tracks = player.queue.tracks?.map((t, i) => {
      const duration = t.info.duration,
        durMins = Math.floor(duration / 60_000),
        durSecs = Math.floor((duration - durMins * 60_000) / 1_000);
      return `**${i + 1}.** [${t.info.title}](${t.info.uri}) by [${t.info.author}](${
        t.pluginInfo.artistUrl
      }) [${durMins}:${(durSecs < 10 ? '0' : '') + durSecs}]`;
    });

    this.client.cacheTracks.set(uuid, tracks);

    embed.setDescription(`Now Playing:
[${player.queue.current.info.title}](${player.queue.current.info.uri}) by [${
      player.queue.current.info.author
    }](${player.queue.current.pluginInfo.artistUrl}) [${posMins}:${(posSecs < 10 ? '0' : '') + posSecs} left]

Up next:\n${tracks.length < 1 ? 'No upcoming tracks! :3' : tracks.slice(0, 10).join('\n')}`);
    await interaction.reply({
      ephemeral: false,
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [buttonPrev, buttonNext],
        },
      ],
    });
  }
}
