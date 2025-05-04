import { REST, Routes } from 'discord.js';
import 'dotenv/config';

const commands = [
  {
    type: 1,
    name: 'play',
    description: 'Play a song',
    options: [
      {
        type: 3,
        name: 'query',
        description: 'Query the various things of music.',
        required: true,
      },
    ],
  },
  {
    type: 1,
    name: 'playfile',
    description: 'Play a file instead!',
    options: [
      {
        type: 11,
        name: 'attachy',
        description: 'Your everyday audio file goes here!',
        required: true,
      },
    ],
  },
  {
    type: 1,
    name: 'prank',
    description: 'Prank a suckah w/ an audio clip.',
    options: [
      {
        type: 11,
        name: 'attachy',
        description: 'Your everyday audio file goes here!',
        required: true,
      },
      {
        type: 6,
        name: 'prankee',
        description: 'The suckah',
        required: true,
      },
    ],
  },
  {
    type: 1,
    name: 'search',
    description: 'Search for your tunes using syllables!',
    options: [
      {
        type: 3,
        name: 'query',
        description: 'Query the various things of music.',
        required: true,
      },
      {
        type: 3,
        name: 'source',
        description: 'Pick your poison ;)',
        required: false,
        choices: [
          {
            name: 'YouTube',
            value: 'ytsearch:',
          },
          {
            name: 'YouTube Music',
            value: 'ytmsearch:',
          },
          {
            name: 'Spotify',
            value: 'spsearch:',
          },
          // {
          //   name: 'Deezer',
          //   value: 'dzsearch:',
          // },
          {
            name: 'SoundCloud',
            value: 'scsearch:',
          },
        ],
      },
    ],
  },
  {
    name: 'skip',
    description: 'Skip a song.',
  },
  {
    name: 'stop',
    description: 'Stop the music.',
  },
  {
    name: 'queue',
    description: 'Get what tunes are coming on!',
  },
  {
    name: 'nowplaying',
    description: "What's playing right now? Find out!",
  },
  {
    name: 'pause',
    description: 'Pause the music ._.',
  },
  {
    name: 'resume',
    description: 'Let the vibe flow through! ^-^',
  },
  {
    name: 'shuffle',
    description: 'Make the bot have dementia and lose track of which song comes first',
  },
  {
    name: 'join',
    description: 'Bored? Lonely? Just use this and have a bit of company! ^.^',
  },
  {
    type: 1,
    name: 'loop',
    description: "Makes the music keep runnin'.",
    options: [
      {
        type: 3,
        name: 'type',
        description: "The type of loopin'",
        required: true,
        choices: [
          {
            name: 'queue',
            value: 'queue',
          },
          {
            name: 'track',
            value: 'track',
          },
          {
            name: 'off',
            value: 'off',
          },
        ],
      },
    ],
  },
  {
    type: 1,
    name: 'volume',
    description: 'Adjust the volume of the tunes.',
    options: [
      {
        type: 4,
        name: 'level',
        description: 'The volume level.',
        required: true,
        min_value: 0,
        max_value: 255,
      },
    ],
  },
  {
    type: 1,
    name: 'seek',
    description: 'Missed a moment? Try -5s!',
    options: [
      {
        type: 3,
        name: 'sook',
        description: "That input thing that's important",
        required: true,
      },
    ],
  },
  {
    type: 1,
    name: 'speak',
    description: "A dev's speakeasy",
    options: [
      {
        type: 3,
        name: 'text',
        description: 'The speaky texty',
        required: true,
      },
      {
        type: 10,
        name: 'pitch',
        description: 'pitch',
        min_value: 0,
        max_value: 255,
      },
      {
        type: 10,
        name: 'speed',
        description: 'speed',
        min_value: 0,
        max_value: 255,
      },
      {
        type: 10,
        name: 'mouth',
        description: 'mouth',
        min_value: 0,
        max_value: 255,
      },
      {
        type: 10,
        name: 'throat',
        description: 'throat',
        min_value: 0,
        max_value: 255,
      },
      {
        type: 5,
        name: 'singmode',
        description: 'To sing? Or not to sing?',
      },
    ],
  },
  {
    type: 1,
    name: 'move',
    description: 'Move songs around the queue.',
    options: [
      {
        type: 10,
        name: 'track',
        description: 'The track you wanna move',
        required: true,
        min_value: 1,
      },
      {
        type: 10,
        name: 'to',
        description: 'Position to',
        min_value: 1,
      },
    ],
  },
];

const admands = [
  {
    type: 1,
    name: 'eval',
    description: 'You know what it does',
    options: [
      {
        type: 3,
        name: 'eval',
        description: 'It does its things',
        required: true,
      },
      {
        type: 5,
        name: 'async',
        description: 'You gotta know',
        required: false,
      },
    ],
  },
  {
    name: 'die',
    description: 'Kills the bot.',
  },
  {
    name: 'reload',
    description: 'Reload the bot.',
  },
  {
    name: 'test',
    description: 'Testing discord changes.',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD), {
    body: admands,
  });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}
