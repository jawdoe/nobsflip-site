import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { getValidEbayAccessToken } from '../utils/ebay-token';

const ebayAuthCheck = {
  data: new SlashCommandBuilder()
    .setName('ebay-auth-check')
    .setDescription('Check if the eBay OAuth token is working'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: 64 });

    const token = await getValidEbayAccessToken();

    const embed = new EmbedBuilder()
      .setTitle('✅ eBay Auth Working')
      .setDescription('A valid eBay access token was found/refreshed successfully.')
      .addFields({
        name: 'Token Preview',
        value: `${token.slice(0, 12)}...`,
      })
      .setColor(0x39ff14)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default ebayAuthCheck;