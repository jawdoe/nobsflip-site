import {
  SlashCommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { getAllFlips, getFlipById, updateFlipById } from '../utils/flips';

const flipSold = {
  data: new SlashCommandBuilder()
    .setName('flip-sold')
    .setDescription('Mark a flip as sold')
    .addStringOption(option =>
      option
        .setName('item')
        .setDescription('Select flip')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addNumberOption(option =>
      option
        .setName('actualsell')
        .setDescription('Actual sell price')
        .setRequired(true)
    ),

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focused = interaction.options.getFocused().toLowerCase();

    const flips = (await getAllFlips()).filter(flip => flip.status === 'active');

    const results = flips
      .filter(
        flip =>
          flip.title.toLowerCase().includes(focused) ||
          flip.id.toLowerCase().includes(focused)
      )
      .slice(0, 25)
      .map(flip => ({
        name: `${flip.title} (${flip.id})`,
        value: flip.id,
      }));

    await interaction.respond(results);
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const id = interaction.options.getString('item', true);
    const actualSell = interaction.options.getNumber('actualsell', true);

    const flip = await getFlipById(id);

    if (!flip) {
      await interaction.editReply('No flip found.');
      return;
    }

    const soldAt = new Date().toISOString();

    const updatedFlip = await updateFlipById(id, {
      status: 'sold',
      actualSell,
      soldAt,
    });

    if (!updatedFlip) {
      await interaction.editReply('Failed to update flip.');
      return;
    }

    const profit = actualSell - updatedFlip.buy;

    const embed = new EmbedBuilder()
      .setTitle('✅ Flip Marked Sold')
      .addFields(
        { name: 'Item', value: updatedFlip.title, inline: true },
        { name: 'Buy', value: `$${updatedFlip.buy.toFixed(2)}`, inline: true },
        { name: 'Sold For', value: `$${actualSell.toFixed(2)}`, inline: true },
        { name: 'Profit', value: `$${profit.toFixed(2)}`, inline: true }
      )
      .setColor(profit >= 0 ? 0x00ff00 : 0xff0000)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default flipSold;