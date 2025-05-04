import { CommandInteraction, CommandInteractionOption } from 'discord.js';
import Command from 'structures/Command';

export default class move extends Command {
  constructor(client) {
    super(client, {
      name: 'move',
      devOnly: false,
    });
  }

  async exec(interaction: CommandInteraction) {
    const player = this.client.lavalink.getPlayer(interaction.guildId);
    if (!player) return await interaction.reply("You can't move it move it :(");

    const track = (interaction.options.get('track', true).value as number) - 1,
      pos = (interaction.options.get('to', false)?.value as number) - 1 || 0;
    let reply;

    if (track + 1 > player.queue.tracks.length) return interaction.reply('There is no track at that point.');
    const tTrack = player.queue.tracks[track];

    if (pos + 1 > player.queue.tracks.length)
      return interaction.reply("Unfortunately, that's out of range for where a track can travel.");
    player.queue.splice(track, 1);
    player.queue.splice(pos, 0, tTrack);
    if (pos === 0) reply = `Moved ${tTrack.info.title} to the front of the queue.`;
    if (pos === track)
      reply = `Moved ${tTrack.info.title} all the way around the queue. The track looks kinda dizzy!`;

    return await interaction.reply(reply ?? `Moved ${tTrack.info.title} to place ${pos + 1}`);
  }
}
