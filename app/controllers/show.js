import _ from 'underscore'
import Transmission from 'modules/Transmission'
import Show from 'modules/Show'
import Prompt from 'modules/Prompt'
import error from 'console-error'
import warn from 'console-warn'

const DIR = process.cwd()
const transmission = new Transmission()
const show = new Show()
const prompt = new Prompt()

async function filesPrompt (episodes, session) {
  for (const ep of episodes) {
    const torrents = await Promise.all(
      _.chain(ep.torrents)
        .sortBy(ep => -ep.seeds)
        .value()
        .map(torrent =>
          show.getTorrentDataForEpisode(
            torrent.torrent
          )
        )
    ).then(result =>
      result.filter(torrent => torrent)
    )

    if (torrents.length === 0) {
      warn(`Skipped episode ${ep.episode}, no torrents found`)
      continue
    }

    const torrentMagnet = await prompt.askForTorrent(torrents)
    transmission.addTorrent(torrentMagnet, DIR)
  }
}

export async function searchForEpisode (name, from, to = 'f') {
  from = isNaN(from) && from !== 'latest' ? 1 : from
  to = isNaN(to) || to === 'f' || from === 'latest'
    ? Infinity
    : to

  if (from === 'latest') warn('the \'-to\' argument will be ignored, since \'latest\' is used')

  try {
    await transmission.load()

    const showName = name.replace(/ /g, '-')
    await show.loadData(showName)

    const seasonNumber = from === 'latest'
      ? show.getLastSeasonNumber()
      : await prompt.askForSeason(show.getSeasons())

    from = from === 'latest'
      ? show.getLastEpisodeNumber()
      : parseInt(from)

    await filesPrompt(
      show.getRangeEpisodes(seasonNumber, from, to)
    )
  } catch (err) {
    return error(err.message)
  }
}
