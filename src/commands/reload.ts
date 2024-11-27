import { CommandInteraction } from 'discord.js';
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

  async exec(interaction: CommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      await build({
        entry: ['src/index.ts', 'src/commands/_index.ts', 'src/events/_index.ts'],
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
      return interaction.editReply({
        content: 'Reloaded.',
      });
    } catch (e) {
      return await interaction.editReply(`**Error:** \`\`\`js\n${e.message}\`\`\``);
    }
  }
}
