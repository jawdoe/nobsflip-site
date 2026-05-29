import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { supabase } from '../lib/supabase';

const ebayPublish = {
  data: new SlashCommandBuilder()
    .setName('ebay-publish')
    .setDescription('Mark an eBay draft as ready to publish')
    .addStringOption(option =>
      option
        .setName('listing_id')
        .setDescription('eBay listing draft ID from Supabase')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const listingId = interaction.options.getString('listing_id', true);

    const { data: listing, error: fetchError } = await supabase
      .from('ebay_listings')
      .select('*')
      .eq('id', listingId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Failed to fetch eBay listing: ${fetchError.message}`);
    }

    if (!listing) {
      await interaction.editReply(`No eBay draft found for ID: ${listingId}`);
      return;
    }

    const { data: updatedListing, error: updateError } = await supabase
      .from('ebay_listings')
      .update({
        ebay_status: 'ready_to_publish',
        draft_ready: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update eBay listing: ${updateError.message}`);
    }

    await supabase.from('ebay_listing_events').insert({
      ebay_listing_id: listingId,
      event_type: 'publish_requested',
      message: `Publish requested by ${interaction.user.username}`,
      api_response: {
        discord_user_id: interaction.user.id,
        discord_username: interaction.user.username,
      },
    });

    const embed = new EmbedBuilder()
      .setTitle('✅ eBay Draft Ready To Publish')
      .setDescription('This does not post live to eBay yet. It marks the draft as reviewed and ready.')
      .addFields(
        { name: 'Listing ID', value: updatedListing.id, inline: false },
        { name: 'Title', value: updatedListing.title ?? 'Untitled', inline: false },
        { name: 'SKU', value: updatedListing.ebay_sku ?? 'No SKU', inline: true },
        { name: 'Status', value: updatedListing.ebay_status ?? 'unknown', inline: true },
        {
          name: 'Price',
          value: updatedListing.buy_now_price
            ? `$${Number(updatedListing.buy_now_price).toFixed(2)}`
            : 'Not set',
          inline: true,
        }
      )
      .setColor(0x39ff14)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default ebayPublish;