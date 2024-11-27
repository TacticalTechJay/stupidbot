import { CommandInteraction, TextChannel } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
export default class die extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'die',
      devOnly: true,
    });
  }

  async exec(interaction: CommandInteraction) {
    if (this.client.lavalink.players.size > 0)
      for (const p of this.client.lavalink.players) {
        const player = this.client.lavalink.getPlayer(p[0]);
        const channel = (await this.client.channels.fetch(player.textChannelId)) as TextChannel;
        channel.send(
          `Looks like I\'m being put out! See you soon!${
            player.queue.current
              ? " Here's the song you're currently listening to and the upcoming one so you have a jumpstart on your tunes for when I come back: " +
                player.queue.current.info.title +
                ' by ' +
                player.queue.current.info.author
              : ''
          }`
        );
        await player.destroy();
      }
    await interaction.reply('Farewell...');
    return process.exit();
  }
}
