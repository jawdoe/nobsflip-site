import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { getAllFlips } from '../utils/flips';

const flipList = {
  data: new SlashCommandBuilder()
    .setName('flip-list')
    .setDescription('Show recent flips')
    .addIntegerOption(option =>
      option
        .setName('count')
        .setDescription('How many flips to show')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const count = interaction.options.getInteger('count') ?? 5;
    const flips = (await getAllFlips()).slice(0, count);

    if (flips.length === 0) {
      await interaction.editReply('No flips found yet.');
      return;
    }

    const lines = flips.map(flip => {
      const amount =
        flip.status === 'sold' && flip.actualSell !== null
          ? flip.actualSell
          : flip.sell;

      const profit = amount - flip.buy;
      const photoMarker = flip.photoUrl ? ' 🖼️' : '';

      return `**${flip.id}** • ${flip.title}${photoMarker} • ${flip.status.toUpperCase()} • Buy $${flip.buy.toFixed(2)} • Sell $${amount.toFixed(2)} • Profit $${profit.toFixed(2)}`;
    });

    const embed = new EmbedBuilder()
      .setTitle('📋 Recent Flips')
      .setDescription(lines.join('\n'))
      .setColor(0x3498db)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default flipList;