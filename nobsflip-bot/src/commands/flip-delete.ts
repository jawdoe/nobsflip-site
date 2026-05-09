import {
  SlashCommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { getAllFlips, getFlipById, deleteFlipById } from '../utils/flips';

const flipDelete = {
  data: new SlashCommandBuilder()
    .setName('flip-delete')
    .setDescription('Delete a flip')
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
    await interaction.deferReply();

    const id = interaction.options.getString('item', true);
    const flip = await getFlipById(id);

    if (!flip) {
      await interaction.editReply('No flip found.');
      return;
    }

    await deleteFlipById(id);

    const amount =
      flip.status === 'sold' && flip.actualSell !== null
        ? flip.actualSell
        : flip.sell;

    const profit = amount - flip.buy;

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Flip Deleted')
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
        { name: 'Profit', value: `$${profit.toFixed(2)}`, inline: true }
      )
      .setFooter({
        text: `Deleted by ${interaction.user.username}`,
      })
      .setColor(0xe74c3c)
      .setTimestamp();

    if (flip.photoUrl) {
      embed.setImage(flip.photoUrl);
    }

    await interaction.editReply({ embeds: [embed] });

    const logChannelId = process.env.FLIP_LOG_CHANNEL_ID;

    if (!logChannelId) return;

    try {
      const logChannel = await interaction.client.channels.fetch(logChannelId);

      if (!logChannel || !logChannel.isTextBased()) return;

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send flip delete log message:', error);
    }
  },
};

export default flipDelete;