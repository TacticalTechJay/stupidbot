import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from '@discordjs/voice';
import { CommandInteraction, GuildMember } from 'discord.js';
import SamJs from 'sam-js';
import { Readable } from 'stream';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
import { Track } from 'lavalink-client/dist/types';
import random from 'random';

export default class speak extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'speak',
      devOnly: false,
    });
  }

  async exec(interaction: CommandInteraction) {
    const playerr = this.client.lavalink.getPlayer(interaction.guildId);
    const member = interaction.member as GuildMember;
    const text = interaction.options.get('text').value as string;
    const ops: SamJsOptions = {
      pitch: (interaction.options.get('pitch')?.value || random.int(1, 255)) as number,
      speed: (interaction.options.get('speed')?.value || random.int(1, 255)) as number,
      mouth: (interaction.options.get('mouth')?.value || random.int(1, 255)) as number,
      throat: (interaction.options.get('throat')?.value || random.int(1, 255)) as number,
      singmode: (interaction.options.get('singmode')?.value || false) as boolean,
    };
    random.use(Date.now());

    let connection = getVoiceConnection(interaction.guildId);

    // const track: Track = {
    //   info: {
    //     identifier: null,
    //     title: `SAM Speak - ${text}`,
    //     author: interaction.user.username,
    //     duration: 0,
    //     artworkUrl: null,
    //     uri: null,
    //     sourceName: 'youtubemusic',
    //     isSeekable: false,
    //     isStream: false,
    //     isrc: null,
    //   },
    //   pluginInfo: {},
    // };

    if (!member.voice?.channelId)
      return interaction.reply('You gotta be in a voice channel for this. :neutral_face:');
    if (!!playerr)
      return interaction.reply({ content: `I can't speak, the mic's with music playing.`, ephemeral: true });
    if (!!connection)
      return interaction.reply({
        content: 'I might be speaking already or pranking someone currently',
        ephemeral: true,
      });

    try {
      const sam = new SamJs(ops);
      const read = new Readable({
        read() {
          this.push(sam.wav(text));
          this.push(null);
        },
      });
      const audio = createAudioResource(read);
      connection = joinVoiceChannel({
        channelId: member.voice.channelId,
        guildId: interaction.guild.id,
        // @ts-ignore
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: true,
      });
      const player = createAudioPlayer();

      connection.subscribe(player);
      player.play(audio);

      player.on('stateChange', async (prevState, curState) => {
        if (prevState.status === AudioPlayerStatus.Playing && curState.status === AudioPlayerStatus.Idle) {
          await connection.disconnect();
          await connection.destroy();
        }
      });

      return interaction.reply(
        `${member.nickname ?? interaction.user.username} has said \`${text}\`.\`\`\`/speak pitch:${
          ops.pitch
        } speed:${ops.speed} mouth:${ops.mouth} throat:${ops.throat} singmode:${ops.singmode}\`\`\``
      );
    } catch (e) {
      interaction.reply('Sam broke :(');
      console.error(e);
      return;
    }
  }
}
