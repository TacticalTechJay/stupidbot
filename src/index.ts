import { getVoiceConnections } from '@discordjs/voice';
import { GatewayIntentBits, TextChannel } from 'discord.js';
import 'dotenv/config';
import Client from 'structures/MusicClient';

const client = new Client(
  {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMembers,
    ],
  },
  process.env.DEVS.split(',')
);

async function graceKill() {
  if (client.lavalink.players.size > 0)
    for (const p of client.lavalink.players) {
      const player = client.lavalink.getPlayer(p[0]);
      const channel = (await client.channels.fetch(player.textChannelId)) as TextChannel;
      channel.send(
        `Looks like I\'ve either caught a nasty bug or am being put out. Either way, I bid farewell! See you soon!${
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
      await channel.send("I've encountered either a really bad error or am being put out while doing something.");
      connection[1].disconnect();
      await new Promise((r) => setTimeout(r, 100));
      connection[1].destroy();
    } catch (e) {
      console.error(e);
      connection[1].disconnect();
      await new Promise((r) => setTimeout(r, 100));
      connection[1].destroy();
      return;
    }
  }
}

process.on('uncaughtException', async (err) => {
  console.error(
    `Got a nasty one...\nIt goes by ${err.name}\nThe message is ${err.message}\nCaused by ${err.cause}\nThe stack is ${err.stack}.`
  );
  await graceKill();
  process.exit(1);
});

process.on('SIGINT', async () => {
  await graceKill();
  process.exit(0);
});

client.login(process.env.TOKEN);
