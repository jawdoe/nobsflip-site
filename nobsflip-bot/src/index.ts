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
commands.set(ping.data.name, ping);
commands.set(flipAdd.data.name, flipAdd);
commands.set(flipList.data.name, flipList);
commands.set(flipSold.data.name, flipSold);
commands.set(flipView.data.name, flipView);
commands.set(flipEdit.data.name, flipEdit);
commands.set(flipDelete.data.name, flipDelete);
commands.set(profit.data.name, profit);

client.once(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isAutocomplete()) {
    const command = commands.get(interaction.commandName);

    if (!command?.autocomplete) return;

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error('Autocomplete error:', error);
    }

    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

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