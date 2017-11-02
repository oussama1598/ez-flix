import program from 'commander'
import { searchForEpisode } from './controllers/show'
import { isBoolean } from 'util'

const parseINT = val => parseInt(val)

program
  .version('0.0.1')
  .usage('[options] <name>')
  .option('-f, --from <n>', 'From a specific episode', parseINT, 1)
  .option('-t, --to <n>', 'To a specific episode', parseINT, 'f')
  .option('-n, --nosearch', 'Bypass traktv shows search')
  .parse(process.argv);

(async function () {
  if (!program.args.length) {
    program.outputHelp()
  } else {
    try {
      await searchForEpisode(
        program.args[0],
        program.from,
        program.to,
        program.nosearch
      )
    } catch (error) {
      console.log(error.message)
    }
  }
})()
