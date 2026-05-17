import {
  ButtonInteraction,
  Client,
  Collection,
  CommandInteraction,
  Snowflake,
  StringSelectMenuInteraction,
} from 'discord.js';
import { LavalinkManager, LavaSearchResponse, SearchResult } from 'lavalink-client';
import Event from 'structures/Event';
import Command from 'structures/Command';
import ButtonCommand from 'structures/ButtonCommand';
import { sep } from 'path';

export default class MusicClient extends Client {
  devs: Snowflake[];
  lavalink: LavalinkManager;
  cacheTracks: Collection<
    string,
    { msgId: Snowflake; guildId: Snowflake; tracks: string[]; lastInteract?: number }
  >;
  cacheRes: Collection<`${string}-${string}`, LavaSearchResponse | SearchResult>;
  commands: Collection<
    string,
    Command & {
      exec: (
        interaction: CommandInteraction | StringSelectMenuInteraction,
      ) => Promise<void | null> | void | null;
    }
  >;
  btnCommands: Collection<
    string,
    ButtonCommand & {
      exec: (interaction: ButtonInteraction, ops: string[]) => Promise<void | null>;
    }
  >;

  constructor(options) {
    super(options);

    this.devs = process.env.DEVS.split(',');
    this.cacheTracks = new Collection();
    this.cacheRes = new Collection();
    this.commands = new Collection();
    this.btnCommands = new Collection();

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
        defaultSearchPlatform: 'dzsearch',
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
    this.loadBtnCmds();
  }

  async loadEvents(): Promise<void> {
    console.log('Importing event folder');
    delete require.cache[
      require.resolve(`.${sep.replace(sep, '/')}events${sep.replace(sep, '/')}_index.cjs`)
    ];
    const events = await import(
      `.${sep.replace(sep, '/')}events${sep.replace(sep, '/')}_index.cjs?time=${Date.now()}`
    );
    for (const e of events.default.discord) {
      const event = new e(this);
      console.log(`Loading ${event.name}:discord`);
      this.removeAllListeners(event.name);
      this.on(event.name, (...args) => {
        // @ts-ignore
        event.exec(...args);
      });
    }
    for (const e of events.default.lavalink) {
      const event = new e(this);
      console.log(`Loading ${event.name}:lavalink`);
      this.lavalink.removeAllListeners(event.name);
      this.lavalink.on(event.name, (...args) => {
        // @ts-ignore
        event.exec(...args);
      });
    }
    return;
  }

  async loadBtnCmds(): Promise<void> {
    console.log('Importing button commands folder');
    const cache =
      require.cache[require.resolve(`.${sep.replace(sep, '/')}buttons${sep.replace(sep, '/')}_index.cjs`)];
    if (cache?.exports)
      for (const exports of cache.exports)
        delete require.cache[
          require.resolve(`.${sep.replace(sep, '/')}buttons${sep.replace(sep, '/')}_index.cjs`)
        ].exports[exports];
    delete require.cache[
      require.resolve(`.${sep.replace(sep, '/')}buttons${sep.replace(sep, '/')}_index.cjs`)
    ];

    const commands = await import(
      `.${sep.replace(sep, '/')}buttons${sep.replace(sep, '/')}_index.cjs?time=${Date.now()}`
    );
    for (const c of commands.default) {
      const command = new c(this);
      console.log(`Loading ${command.name}`);
      this.btnCommands.set(command.name, command);
    }
    return;
  }

  async loadCommands(): Promise<void> {
    console.log('Importing command folder');
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

    const commands = await import(
      `.${sep.replace(sep, '/')}commands${sep.replace(sep, '/')}_index.cjs?time=${Date.now()}`
    );
    for (const c of commands.default) {
      const command = new c(this);
      console.log(`Loading ${command.name}`);
      this.commands.set(command.name, command);
    }
    return;
  }
}
