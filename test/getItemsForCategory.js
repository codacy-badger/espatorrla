const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
chai.use(chaiAsPromised)

const expect = chai.expect;
const assert = require('chai').assert

const categories = require('../categories.json')
const { getItemsForCategory } = require('../src/getItemsForCategory')
const { getWorkingPage } = require('../src/getWorkingPage')


// Default category (the most updated one)
const CATEGORY = categories.HD_MOVIES

describe('Get entries for a given category', () => {

  /*
    ##     ##    ###    ##       #### ########     ###    ######## ####  #######  ##    ## 
    ##     ##   ## ##   ##        ##  ##     ##   ## ##      ##     ##  ##     ## ###   ## 
    ##     ##  ##   ##  ##        ##  ##     ##  ##   ##     ##     ##  ##     ## ####  ## 
    ##     ## ##     ## ##        ##  ##     ## ##     ##    ##     ##  ##     ## ## ## ## 
     ##   ##  ######### ##        ##  ##     ## #########    ##     ##  ##     ## ##  #### 
      ## ##   ##     ## ##        ##  ##     ## ##     ##    ##     ##  ##     ## ##   ### 
       ###    ##     ## ######## #### ########  ##     ##    ##    ####  #######  ##    ##  
  */

  describe('Testing parameters validation', () => {
    it('should fail with no URL provided', async () => {
      expect(getItemsForCategory({})).to.be.rejected
    });
  
    it('should fail with no category provided', async () => {
      const options = {
        url: "whatever"
      }
      expect(getItemsForCategory(options)).to.be.rejected
    });
  
    it('should fail with no category id provided', async () => {
      const options = {
        url: "whatever",
        category: {
          description: "whatever"
        }
      }
      expect(getItemsForCategory(options)).to.be.rejected
    });
  
    it('should fail with no category description provided', async () => {
      const options = {
        url: "whatever",
        category: {
          id: "whatever"
        }
      }
      expect(getItemsForCategory(options)).to.be.rejected
    });
  
    it('should fail with no category description provided', async () => {
      const options = {
        url: "whatever",
        category: {
          id: "whatever"
        }
      }
      expect(getItemsForCategory(options)).to.be.rejected
    });

    it('should fail with page limit lower than 1', async () => {
      const options = {
        url: "whatever",
        category: {
          id: "whatever",
          description: "whatever"
        },
        pageLimit: -1
      }
      expect(getItemsForCategory(options)).to.be.rejected
    });
  })

  /*
    ########  ######## ######## ########  #### ######## ##     ##    ###    ##       
    ##     ## ##          ##    ##     ##  ##  ##       ##     ##   ## ##   ##       
    ##     ## ##          ##    ##     ##  ##  ##       ##     ##  ##   ##  ##       
    ########  ######      ##    ########   ##  ######   ##     ## ##     ## ##       
    ##   ##   ##          ##    ##   ##    ##  ##        ##   ##  ######### ##       
    ##    ##  ##          ##    ##    ##   ##  ##         ## ##   ##     ## ##       
    ##     ## ########    ##    ##     ## #### ########    ###    ##     ## ########
  */

  describe('Item retrieval', () => {
    it('should return 0 items on an unexisting category', async (done) => {
      const url = await getWorkingPage()
  
      const options = {
        url: url,
        category: {
          id: '-21',
          description: 'whatever'
        }
      }
  
      const entries = await getItemsForCategory(options)
      assert.isDefined(entries)
      assert.isArray(entries)
      assert.isEmpty(entries)
    });
  
    it('should return some items in an existing category', async () => {
      const options = {
        id: '1027',   // HD Movies
        pages: 1      // Stop early
      }
  
      const entries = await getItemsForCategory(options)
      assert.isDefined(entries)
      assert.isArray(entries)
      assert.isNotEmpty(entries)
    });
  
    it('should return 30 items limiting the page to 2', async () => {
      const options = {
        id: '1027',   // HD Movies
        pages: 2      // Required pages
      }
  
      const entries = await getItemsForCategory(options)
      assert.isDefined(entries)
      assert.isArray(entries)
      assert.isNotEmpty(entries)
      expect(entries).to.have.lengthOf(30)
    });
  
    it('should return required information about every item', async () => {
      const options = {
        id: '1027',   // HD Movies
        pages: 1      // Stop early
      }
  
      const entries = await getItemsForCategory(options)
      assert.isDefined(entries)
      assert.isArray(entries)
      assert.isNotEmpty(entries)
  
      const item = entries[0]
      expect(item).to.have.property('title')
      expect(item).to.have.property('image')
      expect(item).to.have.property('url')
      expect(item).to.have.property('category')
      expect(item).to.have.property('quality')
    });
  })
});
