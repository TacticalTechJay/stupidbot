import { CommandInteraction, GuildMember, StringSelectMenuInteraction } from 'discord.js';
import Event from 'structures/Event';
import { inspect } from 'util';

export default class interactionCreate extends Event {
  constructor(client) {
    super(client, {
      name: 'interactionCreate',
    });
  }

  async exec(interaction: CommandInteraction | StringSelectMenuInteraction) {
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
            `Now playing [${res.tracks[0].info.title}](<${
              res.tracks[0].info.uri
            }>) (IT WAS PLAYED BY ${interaction.user.username.toUpperCase()} :index_pointing_at_the_viewer:)`
          );
        }
        return await interaction.followUp(
          `Added [${res.tracks[0].info.title}](<${
            res.tracks[0].info.uri
          }>) to the queue! (IT WAS ADDED BY ${interaction.user.username.toUpperCase()} :index_pointing_at_the_viewer:)`
        );
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
