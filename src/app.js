import program from 'commander';
import searchForEpisode from 'controllers/show';
import { version } from '../package.json';

const parseINT = val => parseInt(val, 10);

program
  .version(version)
  .usage('[options] <name>')
  .option('-f, --from <n>', 'From a specific episode')
  .option('-t, --to <n>', 'To a specific episode', parseINT, 'f')
  .option('-u, --utorrent', 'Use Utorrent instead of Transmission')
  .parse(process.argv);

if (!program.args.length) {
  program.outputHelp();
} else {
  try {
    searchForEpisode(
      program.args[0],
      program.from,
      program.to,
      program.utorrent
    );
  } catch (error) {
    console.log(error);
  }
}
