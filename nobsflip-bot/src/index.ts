import 'dotenv/config';
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
} from 'discord.js';

import ping from './commands/ping';
import flipAdd from './commands/flip-add';
import flipList from './commands/flip-list';
import flipSold from './commands/flip-sold';
import flipView from './commands/flip-view';
import flipEdit from './commands/flip-edit';
import flipDelete from './commands/flip-delete';
import profit from './commands/profit';
import ebayCreateDraft from './commands/ebay-create-draft';
import ebayPublish from './commands/ebay-publish';
import ebayAuthCheck from './commands/ebay-auth-check';
import ebayTestInventory from './commands/ebay-test-inventory';

type Command = {
  data: {
    name: string;
    toJSON(): unknown;
  };
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commands = new Collection<string, Command>();

const commandList: Command[] = [
  ping,
  flipAdd,
  flipList,
  flipSold,
  flipView,
  flipEdit,
  flipDelete,
  profit,
  ebayCreateDraft,
  ebayPublish,
  ebayAuthCheck,
  ebayTestInventory,
];

for (const command of commandList) {
  commands.set(command.data.name, command);
}

client.once(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  console.log(`Loaded ${commands.size} commands`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isAutocomplete()) {
    const command = commands.get(interaction.commandName);

    if (!command?.autocomplete) return;

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(`Autocomplete error for /${interaction.commandName}:`, error);
    }

    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: `Unknown command: /${interaction.commandName}`,
      flags: 64,
    });

    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Command error for /${interaction.commandName}:`, error);

    const replyPayload = {
      content: 'There was an error while running this command.',
      flags: 64,
    } as const;

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyPayload);
    } else {
      await interaction.reply(replyPayload);
    }
  }
});

async function main(): Promise<void> {
  if (!process.env.DISCORD_TOKEN) {
    throw new Error('Missing DISCORD_TOKEN in .env');
  }

  await client.login(process.env.DISCORD_TOKEN);
}

main().catch(error => {
  console.error('Failed to start bot:', error);
  process.exit(1);
});