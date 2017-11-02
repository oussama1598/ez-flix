import _ from 'underscore'
import { searchForShow } from '../lib/tvshowsData'
import { getEpisodes } from '../lib/eztv'
import { addTorrent, getSession } from '../lib/transmission'
import { prompt } from 'inquirer'
import { parse } from 'url'

const DIR = '/home/oussama/Desktop/TV_SHOWS'

export async function searchForEpisode (name, _from, _to = 'f', byPassSearch = false) {
  const from = isNaN(_from) ? 1 : _from
  const to = isNaN(_to) || _to === 'f'
    ? Infinity
    : _to
  const session = await getSession()

  let showName = name.replace(/ /g, '-')

  if (!byPassSearch) {
    const shows = await searchForShow(showName)

    if (shows.length === 0) throw new Error('No matches for this show')

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

  if (Object.keys(seasons).length === 0) throw new Error('No data found for this show')

  const seasonsPrompt = await prompt({
    type: 'list',
    name: 'season',
    message: 'Seasons: ',
    choices: Object.keys(seasons).map(season => ({
      name: `season ${season}`,
      value: season
    }))
  })
  const episodes = _.chain(seasons[seasonsPrompt.season])
    .sortBy('episodes')
    .filter(ep => (
      ep.episode >= from &&
              ep.episode <= to
    )).value()

  for (const ep of episodes) {
    const torrents = _.chain(ep.torrents)
      .sortBy(ep => -ep.seeds)
      .value()

    if (torrents.length === 0) continue

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
