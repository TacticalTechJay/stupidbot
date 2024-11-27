import { getVoiceConnections } from '@discordjs/voice';
import { GatewayIntentBits, TextChannel } from 'discord.js';
import 'dotenv/config';
import Client from 'structures/MusicClient';

const client = new Client(
  {
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  },
  ['127888387364487168']
);

process.on('uncaughtException', async (err) => {
  console.log('Caught the exception! >:D\n' + err);
  if (client.lavalink.players.size > 0)
    for (const p of client.lavalink.players) {
      const player = client.lavalink.getPlayer(p[0]);
      const channel = (await client.channels.fetch(player.textChannelId)) as TextChannel;
      channel.send(
        `Looks like I\'ve caught a nasty bug... See you soon!${
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
  const connections = getVoiceConnections();
  for (const connection of connections) {
    try {
      const channel = (await client.channels.fetch(connection[1].joinConfig.channelId)) as TextChannel;
      await channel.send("I've encountered a really bad error while doing something.");
      connection[1].disconnect();
      await new Promise((r) => setTimeout(r, 100));
      connection[1].destroy();
      await new Promise((r) => setTimeout(r, 100));
    } catch (e) {
      console.error(e);
      connection[1].disconnect();
      await new Promise((r) => setTimeout(r, 100));
      connection[1].destroy();
      await new Promise((r) => setTimeout(r, 100));
      return;
    }
  }
  process.exit(1);
});

client.login(process.env.TOKEN);
