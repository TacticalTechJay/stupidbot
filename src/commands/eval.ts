import { CommandInteraction } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
import { inspect } from 'util';
export default class evalC extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'eval',
      devOnly: true,
    });
  }

  async exec(interaction: CommandInteraction) {
    await interaction.deferReply();
    let input = interaction.options.get('eval').value as string;
    if (input.startsWith('```js') || (input.startsWith('```') && input.endsWith('```'))) {
      input = input.replace(/`/gi, '').replace(/js/gi, '');
    }
    try {
      let evaled;
      if (!!interaction.options.get('async')) {
        evaled = await (0, eval)(`(async() => { ${input} })()`);
      } else {
        evaled = await (0, eval)(input);
      }
      let evaluation = inspect(evaled, { depth: 1 });
      let dataType = Array.isArray(evaled) ? 'Array<' : typeof evaled,
        dataTypes = [];
      if (~dataType.indexOf('<')) {
        evaled.forEach((d) => {
          if (~dataTypes.indexOf(Array.isArray(d) ? 'Array' : typeof d)) return;
          dataTypes.push(Array.isArray(d) ? 'Array' : typeof d);
        });
        dataType += dataTypes.map((s) => s[0].toUpperCase() + s.slice(1)).join(', ') + '>';
      }
      if (evaluation.length >= 1965) {
        console.log(inspect(evaled, { colors: true }));
        return interaction.editReply('Whoopsies, too long! Check the console :3');
      }
      return await interaction.editReply(`**Done Evaluation:** \`\`\`js\n${evaluation}\`\`\`\n`);
    } catch (e) {
      return await interaction.editReply(`**Error:** \`\`\`js\n${e.message}\`\`\``);
    }
  }
}
