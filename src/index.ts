import { GatewayIntentBits, TextChannel } from 'discord.js';
import 'dotenv/config';
import Client from 'structures/MusicClient';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
});

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
        }`,
      );
      await player.destroy();
    }
  await client.destroy();
}

process.on('uncaughtException', async (err) => {
  console.error(
    `Got a nasty one...\nIt goes by ${err.name}\nThe message is \n${err.message}\nCaused by \n${err.cause}\nThe stack is \n${err.stack}.`,
  );
  await graceKill();
  process.exit(1);
});
process.on('SIGTERM', async () => {
  await graceKill();
  process.exit(0);
});
process.on('SIGINT', async () => {
  await graceKill();
  process.exit(0);
});

client.login(process.env.TOKEN);
