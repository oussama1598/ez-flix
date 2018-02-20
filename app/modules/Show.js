import { getEpisodes } from 'lib/eztv'
import _ from 'underscore'

export default class Show {
  async loadData (showName) {
    this.showsData = await getEpisodes(showName)

    if (Object.keys(this.showsData).length === 0) throw new Error('No data found for this show')
  }

  getSeasons () {
    return Object.keys(this.showsData)
  }

  getRangeEpisodes (season, fromEpisode = 1, toEpisode = Infinity) {
    const episodes = this.getSeasonByNumber(season)

    return _.chain(episodes).sortBy('episodes')
      .filter(ep =>
        ep.episode >= fromEpisode &&
        ep.episode <= toEpisode
      )
      .value()
  }

  getSeasonByNumber (seasonNumber) {
    return this.showsData[seasonNumber]
  }

  getLastSeasonNumber () {
    return Object.keys(this.showsData)
      .reduce((a, b) => parseInt(a) > parseInt(b) ? a : b, 0)
  }

  getLastEpisodeNumber (seasonNumber) {
    return Object.keys(this.showsData[seasonNumber])
      .reduce((a, b) => a.episode > b.episode ? a.episode : b.episode, 0)
  }
}
