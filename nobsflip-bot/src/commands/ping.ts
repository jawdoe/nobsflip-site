import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

const ping = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Pong!');
  },
};

export default ping;