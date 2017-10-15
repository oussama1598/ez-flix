import _ from 'underscore'
import { getShowId, searchForShow } from '../lib/tvshowsData'
import { getTorrents, parseSeason } from '../lib/tvShowsApi'
import { addTorrent, getSession } from '../lib/transmission'
import { prompt } from 'inquirer'
import { parse } from 'url'

const DIR = '/home/oussama/Desktop/TV_SHOWS'

export const searchForEpisode = (name, _from, _to) =>
  getSession()
    .then(session => {
      return searchForShow(name)
        .then(results => {
          if (results.length === 0) {
            return Promise.reject(new Error('Not results found'))
          }

          return prompt({
            type: 'list',
            name: 'show',
            message: 'Here is what i found',
            choices: results.slice(0, 5).map(show => ({
              name: `${show.name.trim()} (${show.url})`,
              value: parse(show.url).pathname.split('/')[2]
            }))
          })
        })
        .then(result => getShowId(result.show))
        .then(imdb => getTorrents(imdb))
        .then(results => {
          return prompt({
            type: 'list',
            name: 'season',
            message: 'Seasons: ',
            choices: Object.keys(results).map(season => ({
              name: `season ${season}`,
              value: season
            }))
          }).then(result => results[result.season])
        })
        .then(parseSeason)
        .then(results => {
          const from = isNaN(_from) ? 1 : _from
          const to = isNaN(_to) || _to === 'f'
            ? _.sortBy(results, ep => -ep.episode)[0].episode
            : _to

          _.chain(results)
            .sortBy('episodes')
            .filter(ep => (
              ep.episode >= from &&
              ep.episode <= to
            ))
            .forEach(ep => {
              if (ep.torrents.length === 0) return

              const torrent = _.sortBy(ep.torrents, ep => -ep.seeds)[0]

              console.log(`Added ${ep.episode} from ${name} (${torrent.quality})`)
              addTorrent(torrent.magnet, DIR, session)
            })
        })
    })
    .catch(console.log)
