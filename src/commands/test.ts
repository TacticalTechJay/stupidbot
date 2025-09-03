import {
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  // GuildMember,
} from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';

export default class test extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'test',
      devOnly: true,
    });
  }

  async exec(interaction: ChatInputCommandInteraction) {
    // const member = interaction.member as GuildMember;
    // const self = (interaction.guild.members.cache.get(this.client.user.id) ??
    //   (await interaction.guild.members.fetchMe())) as GuildMember;

    // if (!member.voice)
    //   return await interaction.reply({
    //     content: 'Erm uhh eyumm u need veesee',
    //     flags: 'Ephemeral',
    //   });

    // const voiceChannel = member.voice.channel;
    // const permissionsMember = voiceChannel.permissionsFor(this.client.user);
    // let permissionsForRoles = [];
    // for (const role of self.roles.cache) {
    //   permissionsForRoles.push(voiceChannel.permissionsFor(role[0]));
    // }
    // return await interaction.reply({
    //   content: `${inspect(permissionsMember)}\n${permissionsMember.has('Connect')}\n${permissionsForRoles
    //     .map((r) => inspect(r) + '\n' + r.has('Connect'))
    //     .join('\n')}`,
    // });
    const prevButton = new ButtonBuilder()
      .setCustomId('prevTest')
      .setEmoji({ name: '◀' })
      .setStyle(ButtonStyle.Primary);

    const nextButton = new ButtonBuilder()
      .setCustomId('nextTest')
      .setEmoji({ name: '▶' })
      .setStyle(ButtonStyle.Primary);

    await interaction.reply({
      content: 'Test',
      components: [
        {
          type: 1,
          components: [prevButton, nextButton],
        },
      ],
    });
  }
}
