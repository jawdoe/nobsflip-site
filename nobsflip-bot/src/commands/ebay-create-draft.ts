import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { supabase } from "../lib/supabase";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

const ebayCreateDraft = {
  data: new SlashCommandBuilder()
    .setName("ebay-create-draft")
    .setDescription("Create an eBay draft for website review")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Basic item title")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("ebay_price")
        .setDescription("Suggested eBay Buy It Now price")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("condition")
        .setDescription("Item condition")
        .setRequired(true)
        .addChoices(
          { name: "New", value: "New" },
          { name: "Used", value: "Used" },
          { name: "For parts or not working", value: "For parts or not working" }
        )
    )
    .addNumberOption((option) =>
      option
        .setName("buy_price")
        .setDescription("What you paid for the item")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Optional eBay category name or note")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Basic notes for the listing")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("postage_notes")
        .setDescription("Postage notes")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option.setName("photo1").setDescription("Main photo").setRequired(false)
    )
    .addAttachmentOption((option) =>
      option.setName("photo2").setDescription("Extra photo").setRequired(false)
    )
    .addAttachmentOption((option) =>
      option.setName("photo3").setDescription("Extra photo").setRequired(false)
    )
    .addAttachmentOption((option) =>
      option.setName("photo4").setDescription("Extra photo").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const title = interaction.options.getString("title", true);
    const ebayPrice = interaction.options.getNumber("ebay_price", true);
    const condition = interaction.options.getString("condition", true);
    const buyPrice = interaction.options.getNumber("buy_price") ?? null;
    const category = interaction.options.getString("category") ?? null;
    const description = interaction.options.getString("description") ?? null;
    const postageNotes = interaction.options.getString("postage_notes") ?? null;

    const photoUrls = [
      interaction.options.getAttachment("photo1")?.url,
      interaction.options.getAttachment("photo2")?.url,
      interaction.options.getAttachment("photo3")?.url,
      interaction.options.getAttachment("photo4")?.url,
    ].filter((url): url is string => Boolean(url));

    const { data: draft, error } = await supabase
      .from("ebay_drafts")
      .insert({
        title,
        description,
        condition,
        category_id: category,
        buy_price: buyPrice,
        suggested_price: ebayPrice,
        final_price: ebayPrice,
        postage_notes: postageNotes,
        notes: description,
        photo_urls: photoUrls,
        status: "draft",
        created_by: `${interaction.user.username} (${interaction.user.id})`,
      })
      .select("id, title, status, final_price")
      .single();

    if (error || !draft) {
      await interaction.editReply({
        content: `Failed to create eBay draft: ${
          error?.message ?? "No draft returned from Supabase."
        }`,
      });
      return;
    }

    const reviewUrl = `${SITE_URL}/admin/ebay-drafts/${draft.id}`;

    const embed = new EmbedBuilder()
      .setTitle("🧾 eBay Draft Created")
      .setDescription("Draft saved to Supabase. Review it on the website before publishing.")
      .addFields(
        { name: "Draft ID", value: draft.id, inline: false },
        { name: "Status", value: draft.status, inline: true },
        { name: "Title", value: title, inline: false },
        { name: "Price", value: `$${ebayPrice.toFixed(2)}`, inline: true },
        { name: "Condition", value: condition, inline: true },
        { name: "Photos", value: `${photoUrls.length}/4`, inline: true },
        { name: "Review Link", value: reviewUrl, inline: false }
      )
      .setColor(0x8cff00)
      .setTimestamp();

    if (photoUrls[0]) {
      embed.setImage(photoUrls[0]);
    }

    await interaction.editReply({ embeds: [embed] });
  },
};

export default ebayCreateDraft;