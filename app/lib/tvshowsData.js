import request from 'request-promise'

const ENDPOINT = 'http://api.tvmaze.com/singlesearch/shows?q=%query%'

export const getShowId = (name, id = 'imdb') =>
  request({
    uri: ENDPOINT.replace('%query%', name),
    json: true
  })
    .then(data => data.externals[id])
