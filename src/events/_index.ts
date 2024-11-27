import interactionCreate from 'events/discord/interactionCreate';
import raw from 'events/discord/raw';
import ready from 'events/discord/ready';
import voiceStateUpdate from 'events/discord/voiceStateUpdate';

import playerQueueEmptyEnd from 'events/lavalink/playerQueueEmptyEnd';
import trackStart from 'events/lavalink/trackStart';
import trackError from 'events/lavalink/trackError';
import Event from 'structures/Event';

export interface events {
  default: {
    discord: Event[];
    lavalink: Event[];
  };
}

export default {
  discord: [interactionCreate, raw, ready, voiceStateUpdate],
  lavalink: [playerQueueEmptyEnd, trackError, trackStart],
};
