import _ from 'underscore';
import Utorrent from 'modules/Utorrent';
import Tranmission from 'modules/Transmission';
import Show from 'modules/Show';
import Prompt from 'modules/Prompt';
import warn from 'console-warn';

const DIR = process.cwd();
const utorrent = new Utorrent();
const tranmission = new Tranmission();
const show = new Show();

async function filesPrompt(episodes, torrentClient) {
  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const ep of episodes) {
    const torrents = _.chain(ep.torrents)
      .sortBy(episode => -episode.seeds)
      .value();

    if (torrents.length) {
      const torrentMagnet = await Prompt.askForTorrent(torrents);
      torrentClient.addTorrent(torrentMagnet, DIR);
    } else warn(`Skipped episode ${ep.episode}, no torrents found`);
  }
  /* eslint-enable no-restricted-syntax, no-await-in-loop */
}

export default async function searchForEpisode(
  name,
  _from,
  _to = 'f',
  useUtorrent = false
) {
  let from =
    Number.isNaN(parseInt(_from, 10)) && _from !== 'latest' ? 1 : _from;
  const to =
    Number.isNaN(parseInt(_to, 10)) || _to === 'f' || _from === 'latest'
      ? Infinity
      : _to;
  const torrentClient = useUtorrent ? utorrent : tranmission;

  if (from === 'latest')
    warn("the '-to' argument will be ignored, since 'latest' is used");

  await torrentClient.getToken();

  const showName = name.replace(/ /g, '-');
  await show.loadData(showName);

  const seasonNumber =
    from === 'latest'
      ? show.getLastSeasonNumber()
      : await Prompt.askForSeason(show.getSeasons());

  from = from === 'latest' ? show.getLastEpisodeNumber() : parseInt(from, 10);

  return filesPrompt(
    show.getRangeEpisodes(seasonNumber, from, to),
    torrentClient
  );
}
