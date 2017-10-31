import _ from 'underscore'
import { searchForShow } from '../lib/tvshowsData'
import { getEpisodes, parseSeason } from '../lib/eztv'
import { addTorrent, getSession } from '../lib/transmission'
import { prompt } from 'inquirer'
import { parse } from 'url'

const DIR = '/home/oussama/Desktop/TV_SHOWS'

const promiseAsync = arrOfPromises =>
  arrOfPromises.reduce((result, provider, index) => {
    return result.then(() => provider())
  }, Promise.resolve())

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
        .then(({ show }) => getEpisodes(show))
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

          const episodes = _.chain(results)
            .sortBy('episodes')
            .filter(ep => (
              ep.episode >= from &&
            ep.episode <= to
            )).value().map(
              ep => () => {
                const torrents = _.chain(ep.torrents)
                  .sortBy(ep => -ep.seeds)
                  .value()

                return prompt({
                  type: 'list',
                  name: 'episode',
                  message: 'Select a file: ',
                  choices: torrents.map(file => ({
                    name: `${file.name}, seeds: ${file.seeds}, size: ${file.size}`,
                    value: file.magnet
                  }))})
                  .then(result => addTorrent(result.episode, DIR, session))
              }
            )

          return promiseAsync(episodes)
        })
    })
    .catch(console.log)
