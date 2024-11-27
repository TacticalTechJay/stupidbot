import die from 'commands/die';
import evalC from 'commands/eval';
import join from 'commands/join';
import loop from 'commands/loop';
import nowplaying from 'commands/nowplaying';
import pause from 'commands/pause';
import play from 'commands/play';
import playfile from 'commands/playfile';
import prank from 'commands/prank';
import queue from 'commands/queue';
import resume from 'commands/resume';
import search from 'commands/search';
import seek from 'commands/seek';
import shuffle from 'commands/shuffle';
import skip from 'commands/skip';
import stop from 'commands/stop';
import volume from 'commands/volume';
import speak from 'commands/speak';
import bored from 'commands/bored';
import reload from 'commands/reload';
import Command from 'structures/Command';

export interface commands {
  default: Command[];
}

export default [
  bored,
  die,
  evalC,
  join,
  loop,
  nowplaying,
  pause,
  play,
  playfile,
  prank,
  queue,
  reload,
  resume,
  search,
  seek,
  shuffle,
  skip,
  speak,
  stop,
  volume,
];
