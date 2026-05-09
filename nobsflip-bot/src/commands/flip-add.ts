import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { createFlip, insertFlip } from '../utils/flips';

const flipAdd = {
  data: new SlashCommandBuilder()
    .setName('flip-add')
    .setDescription('Add a new flip')
    .addStringOption(option =>
      option.setName('title').setDescription('Item name').setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('buy').setDescription('Buy price').setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('sell').setDescription('Expected sell price').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('notes').setDescription('Extra notes').setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('photo').setDescription('Photo of the item').setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const title = interaction.options.getString('title', true);
    const buy = interaction.options.getNumber('buy', true);
    const sell = interaction.options.getNumber('sell', true);
    const notes = interaction.options.getString('notes') ?? 'None';
    const photo = interaction.options.getAttachment('photo');
    const photoUrl = photo?.url ?? null;

    const flip = createFlip({
      title,
      buy,
      sell,
      notes,
      photoUrl,
      addedBy: interaction.user.username,
    });

    await insertFlip(flip);

    const profit = sell - buy;

    const embed = new EmbedBuilder()
      .setTitle('📦 New Flip Added')
      .addFields(
        { name: 'ID', value: flip.id, inline: true },
        { name: 'Item', value: title, inline: true },
        { name: 'Status', value: flip.status, inline: true },
        { name: 'Buy Price', value: `$${buy.toFixed(2)}`, inline: true },
        { name: 'Expected Sell', value: `$${sell.toFixed(2)}`, inline: true },
        { name: 'Expected Profit', value: `$${profit.toFixed(2)}`, inline: true },
        { name: 'Notes', value: notes }
      )
      .setFooter({
        text: `Added by ${interaction.user.username}`,
      })
      .setColor(profit >= 0 ? 0x00ff00 : 0xff0000)
      .setTimestamp();

    if (photoUrl) {
      embed.setImage(photoUrl);
    }

    await interaction.editReply({ embeds: [embed] });

    const logChannelId = process.env.FLIP_LOG_CHANNEL_ID;
    if (!logChannelId) return;

    try {
      const logChannel = await interaction.client.channels.fetch(logChannelId);
      if (!logChannel || !logChannel.isTextBased()) return;

      if ('send' in logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Failed to send flip log message:', error);
    }
  },
};

export default flipAdd;