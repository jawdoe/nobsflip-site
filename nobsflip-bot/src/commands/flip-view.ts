import {
  SlashCommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { getAllFlips, getFlipById } from '../utils/flips';

const flipView = {
  data: new SlashCommandBuilder()
    .setName('flip-view')
    .setDescription('View one flip')
    .addStringOption(option =>
      option
        .setName('item')
        .setDescription('Select flip')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focused = interaction.options.getFocused().toLowerCase();

    const flips = await getAllFlips();

    const results = flips
      .filter(
        flip =>
          flip.title.toLowerCase().includes(focused) ||
          flip.id.toLowerCase().includes(focused)
      )
      .slice(0, 25)
      .map(flip => ({
        name: `${flip.title} (${flip.id}) [${flip.status}]`,
        value: flip.id,
      }));

    await interaction.respond(results);
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: 64 });

    const id = interaction.options.getString('item', true);
    const flip = await getFlipById(id);

    if (!flip) {
      await interaction.editReply({
        content: 'No flip found.',
      });
      return;
    }

    const amount =
      flip.status === 'sold' && flip.actualSell !== null
        ? flip.actualSell
        : flip.sell;

    const profit = amount - flip.buy;

    const embed = new EmbedBuilder()
      .setTitle('🔎 Flip Details')
      .addFields(
        { name: 'ID', value: flip.id, inline: true },
        { name: 'Item', value: flip.title, inline: true },
        { name: 'Status', value: flip.status.toUpperCase(), inline: true },
        { name: 'Buy Price', value: `$${flip.buy.toFixed(2)}`, inline: true },
        {
          name: flip.status === 'sold' ? 'Actual Sell' : 'Expected Sell',
          value: `$${amount.toFixed(2)}`,
          inline: true,
        },
        { name: 'Profit', value: `$${profit.toFixed(2)}`, inline: true },
        { name: 'Notes', value: flip.notes || 'None' },
        { name: 'Added By', value: flip.addedBy, inline: true },
        {
          name: 'Created',
          value: new Date(flip.createdAt).toLocaleString(),
          inline: true,
        }
      )
      .setColor(flip.status === 'sold' ? 0x2ecc71 : 0x3498db)
      .setTimestamp();

    if (flip.photoUrl) {
      embed.setImage(flip.photoUrl);
    }

    await interaction.editReply({ embeds: [embed] });
  },
};

export default flipView;