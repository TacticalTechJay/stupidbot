import { CommandInteraction } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
export default class nowplaying extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'nowplaying',
      devOnly: false,
    });
  }

  async exec(interaction: CommandInteraction) {
    const player = this.client.lavalink.getPlayer(interaction.guildId);
    if (!player || !player?.queue.current) return await interaction.reply('Nothing is playing!');

    const posR = player.position;
    const duration = player.queue.current.info.duration;

    const pos = Math.floor((posR / duration) * 20);
    let str = '-------------------';
    str = str.slice(0, pos) + '+' + str.slice(pos, str.length);

    const posMins = Math.floor(posR / 60_000),
      posSecs = Math.floor((posR - posMins * 60_000) / 1_000),
      durMins = Math.floor(duration / 60_000),
      durSecs = Math.floor((duration - durMins * 60_000) / 1_000),
      leftover = duration - posR,
      leftoverM = Math.floor(leftover / 60_000),
      leftoverS = Math.floor((leftover - leftoverM * 60_000) / 1_000);

    return await interaction.reply(
      `Currently playing [${player.queue.current.info.title}](<${player.queue.current.info.uri}>) by ${
        player.queue.current.info.author
      }\n${str}\n${posMins}:${(posSecs < 10 ? '0' : '') + posSecs}/${durMins}:${
        (durSecs < 10 ? '0' : '') + durSecs
      } (${leftoverM} minute${leftoverM > 1 ? 's' : ''} ${leftoverS} second${leftoverS > 1 ? 's' : ''} left)`
    );
  }
}
