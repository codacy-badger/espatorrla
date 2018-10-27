const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
chai.use(chaiAsPromised)

const expect = chai.expect;
const assert = require('chai').assert
const { getWorkingPage } = require('../src/getWorkingPage')

describe('Get Torrent Working page', () => {
  it('should return the working torrent page, if any', () => {
    getWorkingPage()
      .then(url => {
        assert.isDefined(url)
        assert.isString(url)
      })
      .catch(url => {
        assert.isUndefined(url)
      })
  });

  it('should be rejected on an unexisting page', () => {
    expect( getWorkingPage([''])).to.be.rejected
  });
});
