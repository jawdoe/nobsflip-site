import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import ping from './commands/ping';
import flipAdd from './commands/flip-add';
import flipList from './commands/flip-list';
import flipSold from './commands/flip-sold';
import flipView from './commands/flip-view';
import flipEdit from './commands/flip-edit';
import flipDelete from './commands/flip-delete';
import profit from './commands/profit';

async function main(): Promise<void> {
  if (!process.env.DISCORD_TOKEN) {
    throw new Error('Missing DISCORD_TOKEN');
  }

  if (!process.env.DISCORD_CLIENT_ID) {
    throw new Error('Missing DISCORD_CLIENT_ID');
  }

  if (!process.env.DISCORD_GUILD_ID) {
    throw new Error('Missing DISCORD_GUILD_ID');
  }

  const commands = [
    ping.data.toJSON(),
    flipAdd.data.toJSON(),
    flipList.data.toJSON(),
    flipSold.data.toJSON(),
    flipView.data.toJSON(),
    flipEdit.data.toJSON(),
    flipDelete.data.toJSON(),
    profit.data.toJSON(),
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  console.log('Refreshing application commands...');

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.DISCORD_CLIENT_ID,
      process.env.DISCORD_GUILD_ID
    ),
    { body: commands }
  );

  console.log('Successfully reloaded application commands.');
}

main().catch(error => {
  console.error('Failed to deploy commands:', error);
  process.exit(1);
});