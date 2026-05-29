import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { createFlip, insertFlip, insertEbayDraft } from '../utils/flips';

const flipAdd = {
  data: new SlashCommandBuilder()
    .setName('flip-add')
    .setDescription('Add a new flip and create an eBay draft record')

    .addStringOption(option =>
      option.setName('title').setDescription('Item name').setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('buy').setDescription('Buy price').setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('sell').setDescription('Expected sell price / website target').setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('ebay_price').setDescription('eBay Buy It Now price').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('condition').setDescription('Item condition').setRequired(true)
        .addChoices(
          { name: 'New', value: 'New' },
          { name: 'Used', value: 'Used' },
          { name: 'For parts or not working', value: 'For parts or not working' }
        )
    )
    .addStringOption(option =>
      option.setName('category').setDescription('eBay category name or rough category').setRequired(false)
    )
    .addStringOption(option =>
      option.setName('description').setDescription('eBay description').setRequired(false)
    )
    .addStringOption(option =>
      option.setName('notes').setDescription('Private/internal notes').setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName('free_postage').setDescription('Free postage?').setRequired(false)
    )
    .addNumberOption(option =>
      option.setName('postage_cost').setDescription('Postage cost if not free').setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName('allow_offers').setDescription('Allow offers on eBay?').setRequired(false)
    )
    .addNumberOption(option =>
      option.setName('auto_accept').setDescription('Auto accept offer price').setRequired(false)
    )
    .addNumberOption(option =>
      option.setName('auto_decline').setDescription('Auto decline offer price').setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('photo1').setDescription('Main photo - website + eBay').setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('photo2').setDescription('Extra eBay photo').setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('photo3').setDescription('Extra eBay photo').setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('photo4').setDescription('Extra eBay photo').setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const title = interaction.options.getString('title', true);
    const buy = interaction.options.getNumber('buy', true);
    const sell = interaction.options.getNumber('sell', true);
    const ebayPrice = interaction.options.getNumber('ebay_price', true);

    const condition = interaction.options.getString('condition', true);
    const category = interaction.options.getString('category') ?? null;
    const description = interaction.options.getString('description') ?? null;
    const notes = interaction.options.getString('notes') ?? 'None';

    const freePostage = interaction.options.getBoolean('free_postage') ?? true;
    const postageCost = interaction.options.getNumber('postage_cost') ?? 0;

    const allowOffers = interaction.options.getBoolean('allow_offers') ?? false;
    const autoAccept = interaction.options.getNumber('auto_accept') ?? null;
    const autoDecline = interaction.options.getNumber('auto_decline') ?? null;

    const photo1 = interaction.options.getAttachment('photo1');
    const photo2 = interaction.options.getAttachment('photo2');
    const photo3 = interaction.options.getAttachment('photo3');
    const photo4 = interaction.options.getAttachment('photo4');

    const photoUrls = [photo1, photo2, photo3, photo4]
      .map(photo => photo?.url)
      .filter((url): url is string => Boolean(url));

    const mainPhotoUrl = photoUrls[0] ?? null;

    const flip = createFlip({
      title,
      buy,
      sell,
      notes,
      photoUrl: mainPhotoUrl,
      addedBy: interaction.user.username,
    });

    await insertFlip(flip);

    const ebayDraft = await insertEbayDraft({
      flipId: flip.id,
      title,
      description,
      conditionName: condition,
      categoryName: category,
      buyNowPrice: ebayPrice,
      freePostage,
      postageCost,
      allowOffers,
      autoAcceptPrice: autoAccept,
      autoDeclinePrice: autoDecline,
      imageUrls: photoUrls,
    });

    const profit = sell - buy;

    const embed = new EmbedBuilder()
      .setTitle('📦 New Flip Added + eBay Draft Saved')
      .addFields(
        { name: 'Flip ID', value: flip.id, inline: true },
        { name: 'Item', value: title, inline: true },
        { name: 'Status', value: flip.status, inline: true },

        { name: 'Buy Price', value: `$${buy.toFixed(2)}`, inline: true },
        { name: 'Website Target', value: `$${sell.toFixed(2)}`, inline: true },
        { name: 'Expected Profit', value: `$${profit.toFixed(2)}`, inline: true },

        { name: 'eBay Price', value: `$${ebayPrice.toFixed(2)}`, inline: true },
        { name: 'Condition', value: condition, inline: true },
        { name: 'Category', value: category ?? 'Not set', inline: true },

        { name: 'Postage', value: freePostage ? 'Free postage' : `$${postageCost.toFixed(2)}`, inline: true },
        { name: 'Offers', value: allowOffers ? 'Enabled' : 'Disabled', inline: true },
        { name: 'Photos', value: `${photoUrls.length}/4`, inline: true },

        { name: 'eBay Draft Status', value: ebayDraft.ebay_status, inline: true },
        { name: 'eBay SKU', value: ebayDraft.ebay_sku, inline: true },
        { name: 'Notes', value: notes }
      )
      .setFooter({
        text: `Added by ${interaction.user.username}`,
      })
      .setColor(profit >= 0 ? 0x00ff00 : 0xff0000)
      .setTimestamp();

    if (mainPhotoUrl) {
      embed.setImage(mainPhotoUrl);
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