import { ChatInputCommandInteraction } from 'discord.js';
import Command from 'structures/Command';
import MusicClient from 'structures/MusicClient';
import { build } from 'tsup';

export default class reload extends Command {
  constructor(client: MusicClient) {
    super(client, {
      name: 'reload',
      devOnly: true,
    });
  }

  async exec(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply({ flags: 'Ephemeral' });
      await build({
        entry: ['src/index.ts', 'src/commands/_index.ts', 'src/events/_index.ts', 'src/buttons/_index.ts'],
        platform: 'node',
        format: 'cjs',
        bundle: true,
        minify: 'terser',
        treeshake: true,
        clean: true,
        sourcemap: false,
        external: ['tsup'],
      });
      await this.client.loadCommands();
      await this.client.loadEvents();
      await this.client.loadBtnCmds();
      if (!!global.gc) global.gc();
      return await interaction.editReply({
        content: 'Reloaded.',
      });
    } catch (e) {
      return await interaction.editReply(`**Error:** \`\`\`js\n${e.message}\`\`\``);
    }
  }
}
