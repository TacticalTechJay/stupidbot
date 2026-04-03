import die from 'commands/die';
import evalC from 'commands/eval';
import join from 'commands/join';
import loop from 'commands/loop';
import move from 'commands/move';
import nowplaying from 'commands/nowplaying';
import pause from 'commands/pause';
import play from 'commands/play';
import playfile from 'commands/playfile';
import queue from 'commands/queue';
import reload from 'commands/reload';
import remove from 'commands/remove';
import resume from 'commands/resume';
import search from 'commands/search';
import seek from 'commands/seek';
import shuffle from 'commands/shuffle';
import skip from 'commands/skip';
import stop from 'commands/stop';
import volume from 'commands/volume';
import test from 'commands/test';
// import Command from 'structures/Command';

// export interface commands {
//   default: Command[];
// }

export default [
  die,
  evalC,
  join,
  loop,
  move,
  nowplaying,
  pause,
  play,
  playfile,
  queue,
  reload,
  remove,
  resume,
  search,
  seek,
  shuffle,
  skip,
  stop,
  test,
  volume,
];
