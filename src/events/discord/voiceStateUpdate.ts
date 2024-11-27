import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from '@discordjs/voice';
import { TextChannel, VoiceState } from 'discord.js';
import { get } from 'https';
import { Readable } from 'stream';
import Event from 'structures/Event';

export default class voiceStateUpdate extends Event {
  constructor(client) {
    super(client, {
      name: 'voiceStateUpdate',
    });
  }

  async exec(oldState: VoiceState, newState: VoiceState) {
    const checkPlayer = this.client.lavalink.getPlayer(newState.guild.id);
    const prankload = this.client.prankster.get(newState.id);
    let connection = getVoiceConnection(newState.guild.id);

    if (newState.id === this.client.user.id) return;
    if (!!checkPlayer) return;
    if (!!oldState.channelId && !newState.channelId) return;
    if (!prankload) return;
    if (prankload.prankee !== newState.id) return;
    if (!!connection) return;

    const resp = (await new Promise((r) => get(prankload.url, r))) as Readable;
    const audio = createAudioResource(resp);
    connection = joinVoiceChannel({
      channelId: newState.channelId,
      guildId: newState.guild.id,
      // @ts-ignore
      adapterCreator: newState.guild.voiceAdapterCreator,
      selfDeaf: true,
    });
    const player = createAudioPlayer();

    connection.subscribe(player);
    player.play(audio);

    this.client.prankster.delete(newState.id);

    await ((await this.client.channels.fetch(prankload.textchannel)) as TextChannel).send(
      `Mwuahaha! You've been pranked by <@${prankload.prankster}>, <@${prankload.prankee}>! >:3`
    );

    player.on('stateChange', async (prevState, curState) => {
      if (prevState.status === AudioPlayerStatus.Playing && curState.status === AudioPlayerStatus.Idle) {
        await connection.disconnect();
        await connection.destroy();
      }
    });
  }
}
