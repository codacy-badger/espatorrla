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

    it('should fail with page limit lower than 1', async () => {
      const options = {
        url: "whatever",
        category: {
          id: "whatever",
          description: "whatever"
        },
        limitPage: -1
      }
      expect(getItemsForCategory(options)).to.be.rejected
    });

    it('should fail with an unexisting page', async () => {
      const options = {
        url: "whatever",
        category: {
          id: "whatever",
          description: "whatever"
        },
        limitPage: 1
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
    it('should return 0 items on an unexisting category', async () => {
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
      const url = await getWorkingPage()

      const options = {
        url: url,
        category: CATEGORY,
        limitPage: 1
      }

      const entries = await getItemsForCategory(options)
      assert.isDefined(entries)
      assert.isArray(entries)
      assert.isNotEmpty(entries)
    });

    it('should return 30 items limiting the page to 2', async () => {
      const url = await getWorkingPage()

      const options = {
        url: url,
        category: CATEGORY,
        limitPage: 2
      }

      const entries = await getItemsForCategory(options)
      assert.isDefined(entries)
      assert.isArray(entries)
      assert.isNotEmpty(entries)
      expect(entries).to.have.lengthOf(30)
    });

    it('should return less items on a daily basis than weekly', async () => {
      const url = await getWorkingPage()

      const dayOptions = {
        url: url,
        category: CATEGORY,
        date: 'Hoy'
      }

      const dayEntries = await getItemsForCategory(dayOptions)
      assert.isDefined(dayEntries)
      assert.isArray(dayEntries)

      const monthOptions = {
        url: url,
        category: CATEGORY,
        date: 'Mes'
      }

      const monthEntries = await getItemsForCategory(monthOptions)
      assert.isDefined(monthEntries)
      assert.isArray(monthEntries)
      assert.isNotEmpty(monthEntries)

      assert.isBelow(dayEntries.length, monthEntries.length)
    });

    it('should return required information about every item', async () => {
      const url = await getWorkingPage()

      const options = {
        url: url,
        category: CATEGORY,
        limitPage: 1
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

    it('should return less items on a limit item', async () => {
      const url = await getWorkingPage()

      const options = {
        url: url,
        category: CATEGORY,
        limitPage: 2
      }

      const entries = await getItemsForCategory(options)
      assert.isDefined(entries)
      assert.isArray(entries)
      assert.isNotEmpty(entries)

      const limitItem = entries[5]
      expect(limitItem).to.have.property('title')
      expect(limitItem).to.have.property('image')
      expect(limitItem).to.have.property('url')
      expect(limitItem).to.have.property('category')
      expect(limitItem).to.have.property('quality')

      const limitOptions = {
        url: url,
        category: CATEGORY,
        limitItem: limitItem.url
      }

      const limitedEntries = await getItemsForCategory(limitOptions)
      assert.isDefined(limitedEntries)
      assert.isArray(limitedEntries)
      assert.isNotEmpty(limitedEntries)

      assert.isBelow(limitedEntries.length, entries.length)
    });
  })
});
