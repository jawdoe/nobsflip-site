import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { insertEbayDraft } from '../utils/flips';
import { supabase } from '../lib/supabase';
import { createEbayInventoryItem } from '../utils/ebay-inventory';

const ebayCreateDraft = {
  data: new SlashCommandBuilder()
    .setName('ebay-create-draft')
    .setDescription('Create an eBay draft and push inventory to eBay')
    .addStringOption(option =>
      option.setName('title').setDescription('eBay listing title').setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('ebay_price').setDescription('eBay Buy It Now price').setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('condition')
        .setDescription('Item condition')
        .setRequired(true)
        .addChoices(
          { name: 'New', value: 'New' },
          { name: 'Used', value: 'Used' },
          { name: 'For parts or not working', value: 'For parts or not working' }
        )
    )
    .addStringOption(option =>
      option
        .setName('flip_id')
        .setDescription('Optional Flip ID')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('category').setDescription('eBay category name').setRequired(false)
    )
    .addStringOption(option =>
      option.setName('description').setDescription('eBay description').setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName('free_postage').setDescription('Free postage?').setRequired(false)
    )
    .addNumberOption(option =>
      option.setName('postage_cost').setDescription('Postage cost').setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName('allow_offers').setDescription('Allow offers?').setRequired(false)
    )
    .addNumberOption(option =>
      option.setName('auto_accept').setDescription('Auto accept offer price').setRequired(false)
    )
    .addNumberOption(option =>
      option.setName('auto_decline').setDescription('Auto decline offer price').setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('photo1').setDescription('Main eBay photo').setRequired(false)
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

    const flipId = interaction.options.getString('flip_id') ?? null;
    const title = interaction.options.getString('title', true);
    const ebayPrice = interaction.options.getNumber('ebay_price', true);
    const condition = interaction.options.getString('condition', true);
    const category = interaction.options.getString('category') ?? null;
    const description = interaction.options.getString('description') ?? null;

    const freePostage = interaction.options.getBoolean('free_postage') ?? true;
    const postageCost = interaction.options.getNumber('postage_cost') ?? 0;
    const allowOffers = interaction.options.getBoolean('allow_offers') ?? false;
    const autoAccept = interaction.options.getNumber('auto_accept') ?? null;
    const autoDecline = interaction.options.getNumber('auto_decline') ?? null;

    const photoUrls = [
      interaction.options.getAttachment('photo1')?.url,
      interaction.options.getAttachment('photo2')?.url,
      interaction.options.getAttachment('photo3')?.url,
      interaction.options.getAttachment('photo4')?.url,
    ].filter((url): url is string => Boolean(url));

    const ebayDraft = await insertEbayDraft({
      flipId,
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

    let inventoryStatus = 'Not pushed to eBay inventory';

    try {
      if (photoUrls.length > 0) {
        await createEbayInventoryItem({
          sku: ebayDraft.ebay_sku,
          title,
          description: description ?? title,
          condition,
          imageUrls: photoUrls,
          quantity: 1,
        });

        inventoryStatus = 'Created in eBay inventory';

        await supabase
          .from('ebay_listings')
          .update({
            ebay_status: 'inventory_created',
            draft_ready: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', ebayDraft.id);

        await supabase.from('ebay_listing_events').insert({
          ebay_listing_id: ebayDraft.id,
          event_type: 'inventory_created',
          message: `Inventory item created on eBay by ${interaction.user.username}`,
          api_response: {
            discord_user_id: interaction.user.id,
            discord_username: interaction.user.username,
            sku: ebayDraft.ebay_sku,
          },
        });
      }
    } catch (error) {
      inventoryStatus = 'Failed to create eBay inventory item';

      await supabase
        .from('ebay_listings')
        .update({
          ebay_status: 'inventory_error',
          last_error: error instanceof Error ? error.message : 'Unknown inventory error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ebayDraft.id);

      await supabase.from('ebay_listing_events').insert({
        ebay_listing_id: ebayDraft.id,
        event_type: 'inventory_error',
        message: error instanceof Error ? error.message : 'Unknown inventory error',
        api_response: {
          discord_user_id: interaction.user.id,
          discord_username: interaction.user.username,
        },
      });

      throw error;
    }

    await supabase.from('ebay_listing_events').insert({
      ebay_listing_id: ebayDraft.id,
      event_type: 'draft_created_from_discord',
      message: `Draft created by ${interaction.user.username}`,
      api_response: {
        discord_user_id: interaction.user.id,
        discord_username: interaction.user.username,
      },
    });

    const embed = new EmbedBuilder()
      .setTitle('🧾 eBay Draft Created')
      .setDescription('Draft saved in Supabase and pushed to eBay inventory if photos were supplied.')
      .addFields(
        { name: 'Listing ID', value: ebayDraft.id, inline: false },
        {
          name: 'Flip ID',
          value: flipId ?? 'Standalone draft',
          inline: true,
        },
        { name: 'SKU', value: ebayDraft.ebay_sku, inline: true },
        { name: 'Supabase Status', value: ebayDraft.ebay_status, inline: true },
        { name: 'eBay Inventory', value: inventoryStatus, inline: false },
        { name: 'Title', value: title, inline: false },
        { name: 'Price', value: `$${ebayPrice.toFixed(2)}`, inline: true },
        { name: 'Condition', value: condition, inline: true },
        { name: 'Photos', value: `${photoUrls.length}/4`, inline: true }
      )
      .setColor(0x8b5cf6)
      .setTimestamp();

    if (photoUrls[0]) {
      embed.setImage(photoUrls[0]);
    }

    await interaction.editReply({ embeds: [embed] });
  },
};

export default ebayCreateDraft;