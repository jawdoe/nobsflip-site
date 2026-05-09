import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { getAllFlips } from '../utils/flips';

const profit = {
  data: new SlashCommandBuilder()
    .setName('profit')
    .setDescription('Show flip totals and profit summary'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const flips = await getAllFlips();

    const totalCount = flips.length;
    const sold = flips.filter(flip => flip.status === 'sold');
    const active = flips.filter(flip => flip.status === 'active');

    const totalBuy = flips.reduce((sum, flip) => sum + flip.buy, 0);
    const totalExpectedSales = flips.reduce((sum, flip) => sum + flip.sell, 0);
    const totalActualSales = sold.reduce(
      (sum, flip) => sum + (flip.actualSell ?? 0),
      0
    );

    const expectedProfit = flips.reduce(
      (sum, flip) => sum + (flip.sell - flip.buy),
      0
    );

    const actualProfit = sold.reduce(
      (sum, flip) => sum + ((flip.actualSell ?? 0) - flip.buy),
      0
    );

    const embed = new EmbedBuilder()
      .setTitle('💰 Profit Summary')
      .addFields(
        { name: 'Total Flips', value: `${totalCount}`, inline: true },
        { name: 'Active', value: `${active.length}`, inline: true },
        { name: 'Sold', value: `${sold.length}`, inline: true },
        { name: 'Total Buy Spend', value: `$${totalBuy.toFixed(2)}`, inline: true },
        { name: 'Expected Sales', value: `$${totalExpectedSales.toFixed(2)}`, inline: true },
        { name: 'Actual Sales', value: `$${totalActualSales.toFixed(2)}`, inline: true },
        { name: 'Expected Profit', value: `$${expectedProfit.toFixed(2)}`, inline: true },
        { name: 'Actual Profit', value: `$${actualProfit.toFixed(2)}`, inline: true }
      )
      .setColor(0xf1c40f)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default profit;