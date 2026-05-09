import {
  SlashCommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { getAllFlips, getFlipById, updateFlipById } from '../utils/flips';

const flipEdit = {
  data: new SlashCommandBuilder()
    .setName('flip-edit')
    .setDescription('Edit an existing flip')
    .addStringOption(option =>
      option
        .setName('item')
        .setDescription('Select flip')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option.setName('title').setDescription('New title').setRequired(false)
    )
    .addNumberOption(option =>
      option.setName('buy').setDescription('New buy price').setRequired(false)
    )
    .addNumberOption(option =>
      option.setName('sell').setDescription('New expected sell price').setRequired(false)
    )
    .addStringOption(option =>
      option.setName('notes').setDescription('New notes').setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('photo').setDescription('New photo').setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('removephoto')
        .setDescription('Remove current photo')
        .setRequired(false)
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
    const title = interaction.options.getString('title');
    const buy = interaction.options.getNumber('buy');
    const sell = interaction.options.getNumber('sell');
    const notes = interaction.options.getString('notes');
    const photo = interaction.options.getAttachment('photo');
    const removePhoto = interaction.options.getBoolean('removephoto') ?? false;

    const flip = await getFlipById(id);

    if (!flip) {
      await interaction.editReply('No flip found.');
      return;
    }

    if (
      title === null &&
      buy === null &&
      sell === null &&
      notes === null &&
      !photo &&
      !removePhoto
    ) {
      await interaction.editReply('You did not provide anything to update.');
      return;
    }

    const updates: Record<string, unknown> = {};

    if (title !== null) updates.title = title;
    if (buy !== null) updates.buy = buy;
    if (sell !== null) updates.sell = sell;
    if (notes !== null) updates.notes = notes;
    if (photo) updates.photoUrl = photo.url;
    if (removePhoto) updates.photoUrl = null;

    const updatedFlip = await updateFlipById(id, updates);

    if (!updatedFlip) {
      await interaction.editReply('Failed to update flip.');
      return;
    }

    const amount =
      updatedFlip.status === 'sold' && updatedFlip.actualSell !== null
        ? updatedFlip.actualSell
        : updatedFlip.sell;

    const profit = amount - updatedFlip.buy;

    const embed = new EmbedBuilder()
      .setTitle('✏️ Flip Updated')
      .addFields(
        { name: 'ID', value: updatedFlip.id, inline: true },
        { name: 'Item', value: updatedFlip.title, inline: true },
        { name: 'Status', value: updatedFlip.status.toUpperCase(), inline: true },
        { name: 'Buy Price', value: `$${updatedFlip.buy.toFixed(2)}`, inline: true },
        {
          name: updatedFlip.status === 'sold' ? 'Actual Sell' : 'Expected Sell',
          value: `$${amount.toFixed(2)}`,
          inline: true,
        },
        { name: 'Profit', value: `$${profit.toFixed(2)}`, inline: true },
        { name: 'Notes', value: updatedFlip.notes || 'None' }
      )
      .setFooter({
        text: `Edited by ${interaction.user.username}`,
      })
      .setColor(0xf39c12)
      .setTimestamp();

    if (updatedFlip.photoUrl) {
      embed.setImage(updatedFlip.photoUrl);
    }

    await interaction.editReply({ embeds: [embed] });

    const logChannelId = process.env.FLIP_LOG_CHANNEL_ID;

    if (!logChannelId) return;

    try {
      const logChannel = await interaction.client.channels.fetch(logChannelId);

      if (!logChannel || !logChannel.isTextBased()) return;

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send flip edit log message:', error);
    }
  },
};

export default flipEdit;