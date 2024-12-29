import { UUID } from 'crypto';
import {
  ButtonBuilder,
  ButtonComponent,
  ButtonInteraction,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  StringSelectMenuInteraction,
} from 'discord.js';
import Event from 'structures/Event';
import { inspect } from 'util';

export default class interactionCreate extends Event {
  constructor(client) {
    super(client, {
      name: 'interactionCreate',
    });
  }

  async exec(interaction: CommandInteraction | StringSelectMenuInteraction | ButtonInteraction) {
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'music_search') {
        const member = interaction.member as GuildMember;
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

        let res;
        try {
          res = await player.search(
            {
              query: interaction.values[0],
            },
            interaction.user
          );
          await interaction.update({
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 3,
                    custom_id: 'music_search',
                    options: [
                      {
                        label: 'You made your choice, no take backs.',
                        value: 'selected',
                        default: true,
                      },
                    ],
                    disabled: true,
                  },
                ],
              },
            ],
          });
        } catch (e) {
          console.error(inspect(e, { colors: true }));
          return await interaction.update({
            content: 'Something went wrong! If a link was provided, it may not be currently supported.',
            components: [],
          });
        }

        if (res.tracks.length > 0) await player.queue.add(res.tracks[0]);
        else {
          if (res.loadType === 'error')
            return await interaction.followUp(
              'Something cataclysmic has happened that prevents me from loading this! Try something else'
            );
          return await interaction.followUp("Couldn't find a track... 😦");
        }
        if (!player.playing) {
          await player.play();
          return await interaction.followUp(
            `Now playing [${res.tracks[0].info.title}](<${res.tracks[0].info.uri}>)`
          );
        }
        return await interaction.followUp(
          `Added [${res.tracks[0].info.title}](<${res.tracks[0].info.uri}>) to the queue!`
        );
      }
    }

    if (interaction.isButton()) {
      const player = this.client.lavalink.getPlayer(interaction.guildId);
      if (!player || !player.queue.current) return;

      const args = interaction.message.embeds[0].footer.text.split(' | '),
        page = args[0]
          .split(' ')[1]
          .split('/')
          .map((n) => parseInt(n)),
        tracks = this.client.cacheTracks.get(args[2] as UUID),
        nowPlaying = player.queue.current,
        playerPos = nowPlaying.info.duration - player.position,
        posMins = Math.floor(playerPos / 60_000),
        posSecs = Math.floor((playerPos - posMins * 60_000) / 1_000),
        npText = `Now Playing:\n[${nowPlaying.info.title}](${nowPlaying.info.uri}) by [${
          nowPlaying.info.author
        }](${nowPlaying.pluginInfo.artistUrl}) [${posMins}:${(posSecs < 10 ? '0' : '') + posSecs} left]`,
        embed = new EmbedBuilder(interaction.message.embeds[0]).setThumbnail(nowPlaying.info.artworkUrl),
        buttonPrev = new ButtonBuilder(
          (interaction.message.components[0].components[0] as ButtonComponent).data
        ),
        buttonNext = new ButtonBuilder(
          (interaction.message.components[0].components[1] as ButtonComponent).data
        );

      if (
        Date.now() - (interaction.message.editedTimestamp || interaction.message.createdTimestamp) >
        300000
      ) {
        this.client.cacheTracks.delete(args[2] as UUID);
        return await interaction.update({ components: [] });
      }

      if (interaction.customId === 'next') {
        const trackSel = tracks.slice(page[0] * 10, 10 + page[0] * 10);
        embed
          .setFooter({ text: `Page: ${page[0] + 1}/${page[1]} | Tracks: ${tracks.length} | ${args[2]}` })
          .setDescription(
            `${npText}\n\nUp next:\n${trackSel.length < 1 ? 'No upcoming tracks! :3' : trackSel.join('\n')}`
          );
        if (page[0] + 1 > 1) buttonPrev.setDisabled(false);
        if (page[0] + 1 == page[1]) buttonNext.setDisabled(true);
        return await interaction.update({
          embeds: [embed],
          components: [{ type: 1, components: [buttonPrev, buttonNext] }],
        });
      }
      if (interaction.customId === 'prev') {
        const trackSel = tracks.slice((page[0] - 2) * 10, 10 + (page[0] - 2) * 10);
        embed
          .setFooter({ text: `Page: ${page[0] - 1}/${page[1]} | Tracks: ${tracks.length} | ${args[2]}` })
          .setDescription(
            `${npText}\n\nUp next:\n${trackSel.length < 1 ? 'No upcoming tracks! :3' : trackSel.join('\n')}`
          );
        if (page[0] - 1 == 1) buttonPrev.setDisabled(true);
        if (page[0] - 1 < page[1]) buttonNext.setDisabled(false);
        return await interaction.update({
          embeds: [embed],
          components: [{ type: 1, components: [buttonPrev, buttonNext] }],
        });
      }
    }
    if (!interaction.isChatInputCommand()) return;

    const command = this.client.commands.get(interaction.commandName);
    if (!command)
      return await interaction.reply({
        content: "This command isn't available yet.",
        ephemeral: true,
      });
    if (command.devOnly && !this.client.devs.includes(interaction.user.id))
      return interaction.reply({ content: 'No', ephemeral: true });
    try {
      return command.exec(interaction);
    } catch (e) {
      console.log(e);
      return interaction.reply('Aww, something went wrong with this command D:');
    }
  }
}
