import interactionCreate from 'events/discord/interactionCreate';
import raw from 'events/discord/raw';
import ready from 'events/discord/clientReady';

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
  discord: [interactionCreate, raw, ready],
  lavalink: [playerQueueEmptyEnd, trackError, trackStart],
};
