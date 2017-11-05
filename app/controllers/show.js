import _ from 'underscore'
import { searchForShow } from '../lib/tvshowsData'
import { getEpisodes } from '../lib/eztv'
import { addTorrent, getSession } from '../lib/transmission'
import { prompt } from 'inquirer'
import { parse } from 'url'

const DIR = '/home/oussama/Desktop/TV_SHOWS'

async function filesPrompt (episodes, session) {
  for (const ep of episodes) {
    const torrents = _.chain(ep.torrents)
      .sortBy(ep => -ep.seeds)
      .value()

    if (torrents.length === 0) {
      console.log(`Skipped episode ${ep.episode}, no torrents found`)
      continue
    }

    const episodePrompt = await prompt({
      type: 'list',
      name: 'magnet',
      message: 'Select a file: ',
      choices: torrents.map(file => ({
        name: `${file.name}, seeds: ${file.seeds}, size: ${file.size}`,
        value: file.magnet
      }))})

    addTorrent(episodePrompt.magnet, DIR, session)
  }
}

async function seasonsPrompt (seasons) {
  const seasonPrompt = await prompt({
    type: 'list',
    name: 'season',
    message: 'Seasons: ',
    choices: Object.keys(seasons).map(season => ({
      name: `season ${season}`,
      value: season
    }))
  })

  return seasonPrompt.season
}

export async function searchForEpisode (name, from, to = 'f', byPassSearch = false) {
  from = isNaN(from) && from !== 'latest' ? 1 : from
  to = isNaN(to) || to === 'f' || from === 'latest'
    ? Infinity
    : to

  if (from === 'latest') console.log('the \'-to\' argument will be ignored, since \'latest\' is used')

  const session = await getSession()

  if (!session) return console.log('Transmission is not running')

  let showName = name.replace(/ /g, '-')

  if (!byPassSearch) {
    const shows = await searchForShow(showName)

    if (shows.length === 0) return console.log('No matches for this show')

    const showsPrompt = await prompt({
      type: 'list',
      name: 'show',
      message: 'Here is what i found',
      choices: shows.slice(0, 5).map(show => ({
        name: `${show.name.trim()} (${show.url})`,
        value: parse(show.url).pathname.split('/')[2]
      }))
    })

    showName = showsPrompt.show
  }

  const seasons = await getEpisodes(showName)

  if (Object.keys(seasons).length === 0) return console.log('No data found for this show')

  const chosenSeason = from === 'latest'
    ? Object.keys(seasons).reduce((a, b) => parseInt(a) > parseInt(b) ? a : b, 0)
    : await seasonsPrompt(seasons)
  const season = seasons[chosenSeason]

  from = from === 'latest'
    ? season.reduce((a, b) => a.episode > b.episode ? a.episode : b.episode)
    : parseInt(from)

  const episodes = _.chain(season)
    .sortBy('episodes')
    .filter(ep => (
      ep.episode >= from &&
          ep.episode <= to
    )).value()

  await filesPrompt(episodes, session)
}
