import { Client, Collection, CommandInteraction, Snowflake, StringSelectMenuInteraction } from 'discord.js';
import { LavalinkManager } from 'lavalink-client';
import Event from 'structures/Event';
import Command from 'structures/Command';
import { sep } from 'path';
import { UUID } from 'node:crypto';

export default class MusicClient extends Client {
  devs: Snowflake[];
  lavalink: LavalinkManager;
  prankster: Collection<
    Snowflake,
    {
      prankee: Snowflake;
      prankster: Snowflake;
      textchannel: Snowflake;
      url: string;
    }
  >;
  cacheTracks: Collection<
    UUID,
    { msgId: Snowflake; guildId: Snowflake; tracks: string[]; lastInteract?: number }
  >;
  commands: Collection<
    string,
    Command & {
      exec: (interaction: CommandInteraction | StringSelectMenuInteraction) => void | null | any;
    }
  >;
  events: Collection<Snowflake, Event>;

  constructor(options, devs: Snowflake[]) {
    super(options);
    this.devs = devs;

    this.cacheTracks = new Collection();
    this.prankster = new Collection();
    this.events = new Collection();
    this.commands = new Collection();
    this.lavalink = new LavalinkManager({
      nodes: [
        {
          authorization: process.env.LAVALINK_PASS,
          host: process.env.LAVALINK_HOST,
          port: parseInt(process.env.LAVALINK_PORT),
          id: process.env.LAVALINK_ID,
        },
      ],
      sendToShard: (guildId, payload) => this.guilds.cache.get(guildId)?.shard?.send(payload),
      client: {
        id: process.env.CLIENT_ID as unknown as string,
        username: 'smoltest',
      },
      autoSkip: true,
      emitNewSongsOnly: true,
      playerOptions: {
        clientBasedPositionUpdateInterval: 150,
        defaultSearchPlatform: 'spsearch',
        volumeDecrementer: 0.75,
        onDisconnect: {
          autoReconnect: false,
          destroyPlayer: true,
        },
        onEmptyQueue: {
          destroyAfterMs: 30_000,
        },
      },
      queueOptions: {
        maxPreviousTracks: 25,
      },
    });

    this.loadEvents();
    this.loadCommands();
  }

  async loadEvents(): Promise<void> {
    delete require.cache[
      require.resolve(`.${sep.replace(sep, '/')}events${sep.replace(sep, '/')}_index.cjs`)
    ];
    const events = await import(
      `.${sep.replace(sep, '/')}events${sep.replace(sep, '/')}_index.cjs?time=${Date.now()}`
    );
    for (const e of events.default.discord) {
      const event = new e(this);
      this.removeAllListeners(event.name);
      this.on(event.name, (...args) => {
        // @ts-ignore
        event.exec(...args);
      });
      this.events.set(event.name, event);
    }
    for (const e of events.default.lavalink) {
      const event = new e(this);
      this.lavalink.removeAllListeners(event.name);
      this.lavalink.on(event.name, (...args) => {
        // @ts-ignore
        event.exec(...args);
      });
      this.events.set(event.name, event);
    }
    return;
  }

  async loadCommands(): Promise<void> {
    const cache =
      require.cache[require.resolve(`.${sep.replace(sep, '/')}commands${sep.replace(sep, '/')}_index.cjs`)];
    if (cache?.exports)
      for (const exports of cache.exports)
        delete require.cache[
          require.resolve(`.${sep.replace(sep, '/')}commands${sep.replace(sep, '/')}_index.cjs`)
        ].exports[exports];
    delete require.cache[
      require.resolve(`.${sep.replace(sep, '/')}commands${sep.replace(sep, '/')}_index.cjs`)
    ];
    if (global.gc) global.gc();
    else console.log('No garbage collector :(');

    const commands = await import(
      `.${sep.replace(sep, '/')}commands${sep.replace(sep, '/')}_index.cjs?time=${Date.now()}`
    );
    for (const c of commands.default) {
      const command = new c(this);
      this.commands.set(command.name, command);
    }
    return;
  }
}
