import request from 'request-promise'

const ENDPOINT = 'https://showsdb-api.herokuapp.com/api/show/'

const fixTitle = title =>
  title.replace(/\.|'| /g, '-')

export const getShowId = (name, id = 'imdb') => {
  console.log(`Searching for ${fixTitle(name)}`)

  return request({
    uri: `${ENDPOINT}${fixTitle(name)}`,
    json: true
  })
    .then(data => data.externals[id])
}
