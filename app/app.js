import program from 'commander'
import { searchForEpisode } from './controllers/show'

program
    .version('0.0.1')
    .usage('[options] <name>')
    .option('-s, --season <n>', 'Select a specific season', parseInt, 1)
    .option('-f, --from <n>', 'From a specific episode', parseInt, 1)
    .option('-t, --to <n>', 'To a specific episode', parseInt, 'f')
    .parse(process.argv)

if (!program.args.length) {
    program.outputHelp()
} else {
    searchForEpisode(
        program.args[0],
        program.season,
        program.from,
        program.to
    )
}