import { convertFromDirectory } from 'joi-to-typescript';

async function types(): Promise<void> {
  // oxlint-disable-next-line no-console
  console.log('Running joi-to-typescript...');

  // Configure your settings here
  const result = await convertFromDirectory({
    schemaDirectory: './src/schemas',
    typeOutputDirectory: './src/interfaces',
    debug: true
  });

  if (result) {
    // oxlint-disable-next-line no-console
    console.log('Completed joi-to-typescript');
  } else {
    // oxlint-disable-next-line no-console
    console.log('Failed to run joi-to-typescript');
  }
}

types();
