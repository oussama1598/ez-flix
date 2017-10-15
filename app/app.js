import program from 'commander'
import { searchForEpisode } from './controllers/show'

const parseINT = val => parseInt(val)

program
  .version('0.0.1')
  .usage('[options] <name>')
  .option('-f, --from <n>', 'From a specific episode', parseINT, 1)
  .option('-t, --to <n>', 'To a specific episode', parseINT, 'f')
  .parse(process.argv)

if (!program.args.length) {
  program.outputHelp()
} else {
  searchForEpisode(
    program.args[0],
    program.from,
    program.to
  )
}
