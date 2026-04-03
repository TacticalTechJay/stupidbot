import {
  BaseInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
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

  async exec(interaction: BaseInteraction) {
    if (interaction.isStringSelectMenu()) return await this.handleStringSelect(interaction);
    if (interaction.isButton()) return await this.handleButton(interaction);
    if (interaction.isChatInputCommand()) return await this.handleCommand(interaction);
  }

  private async handleStringSelect(interaction: StringSelectMenuInteraction) {
    if (interaction.customId === 'music_search') {
      if (
        Date.now() - interaction.message.createdTimestamp > 30_000 ||
        !(interaction.member as GuildMember).voice?.channelId
      )
        return await interaction.message.delete();
      const member = interaction.member as GuildMember;
      const player =
        this.client.lavalink.getPlayer(interaction.guildId) ??
        this.client.lavalink.createPlayer({
          guildId: interaction.guildId,
          voiceChannelId: member.voice.channelId,
          textChannelId: interaction.channelId,
          selfDeaf: true,
          selfMute: false,
          volume: 75,
        });

      if (!player.connected) await player.connect();

      let res;
      try {
        res = await player.search(
          {
            query: interaction.values[0],
          },
          interaction.user,
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
            'Something cataclysmic has happened that prevents me from loading this! Try something else',
          );
        return await interaction.followUp("Couldn't find a track... 😦");
      }
      if (!player.playing) {
        await player.play();
        return await interaction.followUp(
          `Now playing [${res.tracks[0].info.title}](<${res.tracks[0].info.uri}>)`,
        );
      }
      return await interaction.followUp(
        `Added [${res.tracks[0].info.title}](<${res.tracks[0].info.uri}>) to the queue!`,
      );
    }
  }
  private async handleButton(interaction: ButtonInteraction) {
    // if (!!interaction.customId.match(/^\w+Test/)) {
    //   // if (!this.client.devs.includes(interaction.user.id))
    //   //   return await interaction.reply({
    //   //     content: 'Nuh uh!',
    //   //     flags: 'Ephemeral',
    //   //   });
    //   if (interaction.message.interactionMetadata.user.id !== interaction.member.user.id)
    //     return await interaction.reply('User unautherized! ⚠️\nACTIVATING BOYKISSER RAY!!!!');
    //   try {
    //     await interaction.update({
    //       content: 'Spaghetti',
    //       components: [],
    //     });
    //   } catch (e) {
    //     void e;
    //   }
    //   return;
    // }
    const buttonThings = interaction.customId.split('_');
    const btnCommand = this.client.btnCommands.get(buttonThings.shift());
    if (!btnCommand)
      return await interaction.reply({
        content: 'This command is not implemented yet. Let the dev know.',
        flags: 'Ephemeral',
      });
    try {
      btnCommand.exec(interaction, buttonThings);
    } catch (e) {
      console.log(e);
      return interaction.reply({
        content: 'This button does not seem to be working properly... Sorry!',
        flags: 'Ephemeral',
      });
    }
  }
  private async handleCommand(interaction: ChatInputCommandInteraction) {
    const command = this.client.commands.get(interaction.commandName);
    if (!command)
      return await interaction.reply({
        content: "This command isn't available yet.",
        flags: 'Ephemeral',
      });
    if (command.devOnly && !this.client.devs.includes(interaction.user.id))
      return interaction.reply({ content: 'No', flags: 'Ephemeral' });
    try {
      return command.exec(interaction);
    } catch (e) {
      console.log(e);
      return interaction.reply('Aww, something went wrong with this command D:');
    }
  }
}
