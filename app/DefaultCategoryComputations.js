const Immutable = require('immutable')
const _ = require('lodash')
const MemoizeImmutable = require('memoize-immutable')

const Constants = require('./Constants.js')
const CategoryConstants = require('./CategoryConstants.js')



const DefaultCategoryComputations = {

  initialState: function (data) {

    let categories = Immutable.Map()

    Constants.get('columnNames').forEach( columnName => {
      // All of the categories default to being active

      switch(columnName){

      case 'incidentTypes': //7
      case 'status': //3
      case 'province': //13
      case 'substance': //30
      case 'releaseType': //4
      case 'whatHappened': //12
      case 'whyItHappened': //9
      case 'pipelinePhase': //4
      case 'substanceCategory': //6
      case 'pipelineSystemComponentsInvolved': //5
      case 'volumeCategory': { //10
        // Eleven of the columns have a fixed set of categories:

        let activeCategories = Immutable.OrderedMap()

        CategoryConstants.getIn(['dataLoaderCategoryNames', columnName]).forEach( (categoryName, csvHeading) => {
          activeCategories = activeCategories.set(categoryName, true)

          //console.log(activeCategories.count())

        })

        categories = categories.set(columnName, activeCategories)

        break
      }
      case 'company': {
        // Each unique company name constitutes its own category

        const companyNames = data.map( incident => {
          return incident.get('company')
        }).toArray()

        const uniqueCompanyNames = _.uniq(companyNames)
        // TODO: Need to sort this?

        let activeCategories = Immutable.OrderedMap()

        for(const companyName of uniqueCompanyNames) {
          activeCategories = activeCategories.set(companyName, true)
        }

        categories = categories.set('company', activeCategories)

        break
      }
      case 'year': {
        // Each year appearing in the dataset will be a category

        const reportedYears = data.map( incident => {
          return incident.get('year')
        }).toArray()

        const uniqueReportedYears = _.uniq(reportedYears).sort().reverse()

        let activeCategories = Immutable.OrderedMap()

        for(const year of uniqueReportedYears) {
          activeCategories = activeCategories.set(year, true)
        }

        categories = categories.set('year', activeCategories)

        break
      }
      case 'map': 
        // Uniquely, the map has no categories
        categories = categories.set('map', Immutable.Map())
        break
      }

    })

    return categories

  }

}



const MemoizedComputations = {}

for (const name of Object.keys(DefaultCategoryComputations)) {
  MemoizedComputations[name] = MemoizeImmutable(DefaultCategoryComputations[name])
}

module.exports = MemoizedComputations