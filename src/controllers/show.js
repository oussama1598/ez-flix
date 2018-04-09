import _ from 'underscore';
import Transmission from 'modules/Transmission';
import Utorrent from 'modules/Utorrent';
import Show from 'modules/Show';
import Prompt from 'modules/Prompt';
import error from 'console-error';
import warn from 'console-warn';

const DIR = process.cwd();
const transmission = new Transmission();
const utorrent = new Utorrent('http://127.0.0.1:8888/gui', 'admin', 'admin');
const show = new Show();
const prompt = new Prompt();

async function filesPrompt(episodes, session) {
  for (const ep of episodes) {
    const torrents = _.chain(ep.torrents)
      .sortBy(ep => -ep.seeds)
      .value();

    if (torrents.length === 0) {
      warn(`Skipped episode ${ep.episode}, no torrents found`);
      continue;
    }

    const torrentMagnet = await prompt.askForTorrent(torrents);
    transmission.addTorrent(torrentMagnet, DIR);
  }
}

export async function searchForEpisode(name, from, to = 'f') {
  from = isNaN(from) && from !== 'latest' ? 1 : from;
  to = isNaN(to) || to === 'f' || from === 'latest' ? Infinity : to;

  if (from === 'latest')
    warn("the '-to' argument will be ignored, since 'latest' is used");

  await utorrent.getToken();

  await utorrent.addTorrent(
    'magnet:?xt=urn:btih:532369FA74EFB335613FE244252467DD328D49B6&dn=Jumanji%3A+Welcome+to+the+Jungle+%282017%29+%5B720p%5D+%5BYTS.AG%5D&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337'
  );
  // try {
  //   await transmission.load();

  //   const showName = name.replace(/ /g, '-');
  //   await show.loadData(showName);

  //   const seasonNumber =
  //     from === 'latest'
  //       ? show.getLastSeasonNumber()
  //       : await prompt.askForSeason(show.getSeasons());

  //   from = from === 'latest' ? show.getLastEpisodeNumber() : parseInt(from);

  //   await filesPrompt(show.getRangeEpisodes(seasonNumber, from, to));
  // } catch (err) {
  //   return error(err.message);
  // }
}
