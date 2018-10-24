const assert = require('chai').assert
const { getTorrentLink } = require('../src/getTorrentLink')

describe('Get Torrent Link for a given webpage', () => {
  it('should return the link of the torrent', async () => {
    const url = await getTorrentLink('http://torrentrapid.com/descargar/cine-alta-definicion-hd/ant-man-y-la-avispa/')
    assert.isDefined(url)
    assert.isString(url)
  });

  it('should return undefined for a non-torrent link', async () => {
    const url = await getTorrentLink('http://torrentrapid.com/')
    assert.isUndefined(url)
  });
});
