import { GatewayMessageReactionAddDispatch, Routes } from 'discord.js';
import type { VoicePacket, VoiceServer, VoiceState, ChannelDeletePacket } from 'lavalink-client/dist/types';
import Event from 'structures/Event';
import MusicClient from 'structures/MusicClient';

export default class raw extends Event {
  constructor(client: MusicClient) {
    super(client, {
      // @ts-expect-error
      name: 'raw',
    });
  }

  async exec(d) {
    const voiceEvent: VoicePacket | VoiceServer | VoiceState | ChannelDeletePacket = d;
    await this.client.lavalink.sendRawData(voiceEvent);

    if (d.t == 'MESSAGE_REACTION_ADD') {
      const reactEvent: GatewayMessageReactionAddDispatch = d;
      if (
        reactEvent.d.message_author_id === this.client.user.id &&
        this.client.devs.includes(reactEvent.d.user_id) &&
        reactEvent.d.emoji.name === '❌'
      )
        return await this.client.rest.delete(
          Routes.channelMessage(reactEvent.d.channel_id, reactEvent.d.message_id)
        );
    }
  }
}
