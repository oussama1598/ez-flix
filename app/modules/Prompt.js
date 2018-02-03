import { prompt } from 'inquirer'

export default class Prompt {
  askForSeason (seasons) {
    return prompt({
      type: 'list',
      name: 'season',
      message: 'Seasons: ',
      choices: seasons.map(season => ({
        name: `season ${season}`,
        value: season
      }))
    }).then(result => result.season)
  }

  askForTorrent (torrents) {
    return prompt({
      type: 'list',
      name: 'magnet',
      message: 'Select a file: ',
      choices: torrents.map(file => ({
        name: `${file.name}, seeds: ${file.seeds}, size: ${file.size}`,
        value: file.magnet
      }))
    }).then(result => result.magnet)
  }
}
