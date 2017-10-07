import _ from 'underscore'
import { getShowId } from '../lib/tvshowsData'
import { getTorrents } from '../lib/tvShowsApi'
import { addTorrent, getSession } from '../lib/transmission'

const DIR = '/home/oussama/Desktop/TV_SHOWS'

export const searchForEpisode = (name, _season, _from, _to) => {
  const season = isNaN(_season) ? 1 : _season
  return getSession()
    .then(session => {
      return getShowId(name)
        .then(imdb => getTorrents(imdb, season))
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
}
