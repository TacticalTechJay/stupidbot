import { CommandInteraction, GuildMember } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
export default class seek extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'seek',
      devOnly: false,
    });
  }

  async exec(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember;
    if (!member.voice?.channelId) return await interaction.reply('Gotta be in a voice channel. :3');
    const player = this.client.lavalink.getPlayer(interaction.guildId);
    if (!player || !player?.queue.current) return await interaction.reply('Nothing is playing!');
    if (player?.voiceChannelId !== member.voice.channelId)
      return await interaction.reply('Wrong voice channel, join mine!');

    const reg = /^(-?\d+h)?(-?\d+m)?(-?\d+s)?$/,
      sook = interaction.options.get('sook').value as string,
      match = sook.match(reg);

    if (!match && !isNaN(parseInt(sook)))
      try {
        await player.seek(parseInt(sook));
        await interaction.reply("You've seeked, now sow.");
      } catch (e) {
        void e;
        return interaction.reply("Looks like I can't seek through this track... :(");
      }
    else if (!match) return await interaction.reply({ content: 'Invalid input dum dum', ephemeral: true });
    const hours = match[1] ? parseInt(match[1]) * 3600_000 : 0,
      minutes = match[2]
        ? hours < 0
          ? -Math.abs(parseInt(match[2]) * 60_000)
          : parseInt(match[2]) * 60_000
        : 0,
      seconds = match[3]
        ? hours < 0 || minutes < 0
          ? -Math.abs(parseInt(match[3]) * 1_000)
          : parseInt(match[3]) * 1_000
        : 0,
      seekeed = hours + minutes + seconds;

    if (player.position + seekeed > player.queue.current.info.duration)
      return await interaction.reply(
        "If you're gonna skip over that much content, might as well use /skip... :/"
      );
    if (player.position + seekeed < 0)
      return await interaction.reply("I can't go that far, it'll be before the song started!");

    try {
      await player.seek(player.position + seekeed);
    } catch (e) {
      void e;
      return await interaction.reply("Looks like I can't seek through this track... :(");
    }

    const position = player.position,
      posMins = Math.floor(position / 60_000),
      posSecs = Math.floor((position - posMins * 60_000) / 1_000);
    return await interaction.reply(
      `✨ Swoosh ✨\nThere goes that progress bar, right where you need it. You\'re now at ${posMins}:${posSecs}.`
    );
  }
}
