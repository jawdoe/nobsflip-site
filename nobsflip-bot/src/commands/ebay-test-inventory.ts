import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';

import { createEbayInventoryItem } from '../utils/ebay-inventory';

const ebayTestInventory = {
  data: new SlashCommandBuilder()
    .setName('ebay-test-inventory')
    .setDescription('Test creating an eBay inventory item')

    .addStringOption(option =>
      option
        .setName('sku')
        .setDescription('Unique SKU')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('title')
        .setDescription('Item title')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Item description')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('condition')
        .setDescription('Condition')
        .setRequired(true)
        .addChoices(
          { name: 'New', value: 'New' },
          { name: 'Used', value: 'Used' },
          { name: 'For parts', value: 'For parts or not working' }
        )
    )

    .addAttachmentOption(option =>
      option
        .setName('photo')
        .setDescription('Main image')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: 64 });

    const sku = interaction.options.getString('sku', true);
    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);
    const condition = interaction.options.getString('condition', true);

    const photo = interaction.options.getAttachment('photo');

    if (!photo) {
      await interaction.editReply('Photo is required.');
      return;
    }

    await createEbayInventoryItem({
      sku,
      title,
      description,
      condition,
      imageUrls: [photo.url],
      quantity: 1,
    });

    const embed = new EmbedBuilder()
      .setTitle('✅ eBay Inventory Item Created')
      .setDescription(
        'Inventory item successfully pushed to eBay inventory API.'
      )
      .addFields(
        {
          name: 'SKU',
          value: sku,
          inline: true,
        },
        {
          name: 'Condition',
          value: condition,
          inline: true,
        },
        {
          name: 'Title',
          value: title,
        }
      )
      .setImage(photo.url)
      .setColor(0x39ff14)
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
    });
  },
};

export default ebayTestInventory;