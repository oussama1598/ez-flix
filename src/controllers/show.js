import _ from 'underscore';
import Utorrent from 'modules/Utorrent';
import Show from 'modules/Show';
import Prompt from 'modules/Prompt';
import warn from 'console-warn';

const DIR = process.cwd();
const utorrent = new Utorrent('http://127.0.0.1:8888/gui', 'admin', 'admin');
const show = new Show();
const prompt = new Prompt();

async function filesPrompt(episodes) {
  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const ep of episodes) {
    const torrents = _.chain(ep.torrents)
      .sortBy(episode => -episode.seeds)
      .value();

    if (torrents.length) {
      const torrentMagnet = await prompt.askForTorrent(torrents);
      utorrent.addTorrent(torrentMagnet, DIR);
    } else warn(`Skipped episode ${ep.episode}, no torrents found`);
  }
  /* eslint-enable no-restricted-syntax, no-await-in-loop */
}

export default async function searchForEpisode(name, _from, _to = 'f') {
  let from =
    Number.isNaN(parseInt(_from, 10)) && _from !== 'latest' ? 1 : _from;
  const to =
    Number.isNaN(parseInt(_to, 10)) || _to === 'f' || _from === 'latest'
      ? Infinity
      : _to;

  if (from === 'latest')
    warn("the '-to' argument will be ignored, since 'latest' is used");

  await utorrent.getToken();

  const showName = name.replace(/ /g, '-');
  await show.loadData(showName);

  const seasonNumber =
    from === 'latest'
      ? show.getLastSeasonNumber()
      : await prompt.askForSeason(show.getSeasons());

  from = from === 'latest' ? show.getLastEpisodeNumber() : parseInt(from, 10);

  return filesPrompt(show.getRangeEpisodes(seasonNumber, from, to));
}