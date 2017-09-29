const Request = require('client-request/promise')
const D3 = require('d3')
const Moment = require('moment')
const Immutable = require('immutable')
const Promise = require('bluebird')

const DataLoadedCreator = require('./actionCreators/DataLoadedCreator.js')
const SetInitialCategoryStateCreator = require('./actionCreators/SetInitialCategoryStateCreator.js')
const CategoryConstants = require('./CategoryConstants.js')
const RouteComputations = require('./RouteComputations.js')
const SetFromRouterStateCreator = require('./actionCreators/SetFromRouterStateCreator.js')
const DefaultCategoryComputations = require('./DefaultCategoryComputations.js')
const SetSchemaCreator = require('./actionCreators/SetSchemaCreator.js')

function parseYesNo (value, record) {
  if (value === 'Yes' || value === 'yes' || value === '1') {
    return true
  } 
  else if (value === 'No' || (value === '' || value === '0')) {
    // For older incidents, the 'is pipeline system component involved' field is
    // empty. We're interpret this to mean 'no'.
    return false
  }
  else {
    console.warn('Error parsing yes/no value. Value "', value, '" Record:', record)
  }
}

// TODO: This function requires that there be no space after the comma separating
// values in a list of items. The export tool was including commas at last run,
// ensure that the production export tool is altered to not do this.
// At last writing, this affected the incident types, why it happened, and what 
// happened columns. It didn't affect pipeline system components involved
function parseList (record, columnName, value) {
  if (value === '') {
    // Calling string.split on an empty string returns an array containing an
    // empty string, which isn't quite what we want.
    return []
  }
  else {
    const listItems = value.split(',')
    return listItems.map( listItem => {
      const categoryValue = CategoryConstants.getIn(['dataLoaderCategoryNames', columnName, listItem])
        
      if (typeof categoryValue === 'undefined') {
        console.warn(`Error parsing element of list value. Column ${columnName}, Value "${listItem}", Record: `, record)
        // TODO: This kind of error condition could actually lead to crashes
        // or other bad behaviour down the line. Should we upgrade the parser
        // so that it can reject / filter out bad records?
      }
      return categoryValue
    })
  }
}

function volumeCategory(record, volumeString) {

  if (volumeString === 'Not Applicable') {
    return 'notApplicable'
  }
  else if (volumeString === 'Not Provided') {
    return 'notProvided'
  }

  const volume = parseFloat(volumeString)
  
  if (isNaN(volume) || volume < 0) {
    console.warn('Bad numeric volume for incident record', record)
    return 'notProvided'
  }

  if (volume < 1) {
    // 'Less Than 1 m³'
    return 'lessThanOne'
  }
  else if (volume < 1000) {
    // '1 m³ to 1,000 m³'
    return 'lessThanOneThousand'
  } 
  else if (volume < 1000000) {
    // '1,000 m³ to 1,000,000 m³'
    return 'lessThanOneMillion'
  }
  else {
    // 'More than 1,000,000 m³'
    return 'moreThanOneMillion'
  }

}

function readFloat(record, accessor) {

  const float = parseFloat(record[accessor])
  
  if (isNaN(float)) {
    console.warn(`Bad ${accessor} value for incident record`, record)
    // TODO: strictly speaking, there are no good return values to use here
    return 'Not Provided'
  }

  return float

}

// An entry in a record that should belong to a defined vocabulary
// For entries:
// province
// status
// substance
// releaseType
// pipelinePhase
function readConstrainedVocabularyString(record, heading, categoryName) {

  const result = CategoryConstants.getIn(['dataLoaderCategoryNames', categoryName, record[heading]])

  if (typeof result === 'undefined') {
    console.warn(`Bad ${categoryName} value ${record[heading]} for incident record`, record)
  }

  return result

}


// Map from the column names to a friendlier internal format
function csvColumnMapping (d) {

  return {
    incidentNumber: d['Incident Number'],
    incidentTypes: parseList(d, 'incidentTypes', d['Incident Types']),
    reportedDate: Moment(d['Reported Date'], 'MM-DD-YYYY'),
    nearestPopulatedCentre: d['Nearest Populated Centre'],
    province: readConstrainedVocabularyString(d, 'Province', 'province'),
    company: d['Company'],
    status: readConstrainedVocabularyString(d, 'Status', 'status'),
    latitude: readFloat(d, 'Latitude'),
    longitude: readFloat(d, 'Longitude'), 
    affectsCompanyProperty: parseYesNo(d['Affects Company Property'], d),
    offCompanyProperty: parseYesNo(d['Off Company Property'], d),
    affectsPipelineRightOfWay: parseYesNo(d['Affects Pipeline right-of-way'], d),
    affectsOffPipelineRightOfWay: parseYesNo(d['Affects off Pipeline right-of-way'], d),
    approximateVolumeReleased: d['Approximate Volume Released (m³)'],
    volumeCategory: volumeCategory(d, d['Approximate Volume Released (m³)']),
    substance: readConstrainedVocabularyString(d, 'Substance', 'substance'),
    releaseType: readConstrainedVocabularyString(d, 'Release Type', 'releaseType'),
    year: d['Year'],
    whatHappened: parseList(d, 'whatHappened', d['WhatHappened']),
    whyItHappened: parseList(d, 'whyItHappened', d['WhyItHappened']),
    pipelinePhase: readConstrainedVocabularyString(d, 'Pipeline Phase', 'pipelinePhase'),
    werePipelineSystemComponentsInvolved: parseYesNo(d['Were Pipeline System Components Involved?'], d),
    pipelineSystemComponentsInvolved: parseList(d, 'pipelineSystemComponentsInvolved', d['Pipeline System Components Involved']),
  }
}


function afterLoad (store, data) {

  store.dispatch(DataLoadedCreator(data))

  let state = store.getState()
  const categories = DefaultCategoryComputations.initialState(state.data, state.schema)
  store.dispatch(SetInitialCategoryStateCreator(categories))

  state = store.getState()
  const routerState = RouteComputations.urlParamsToState(document.location.search, state.data, state.categories)

  store.dispatch(SetFromRouterStateCreator({
    columns: routerState.columns,
    categories: routerState.categories,
    showEmptyCategories: routerState.showEmptyCategories,
    pinnedIncidents: routerState.pinnedIncidents,
    selectedIncident: routerState.selectedIncident,
    language: routerState.language,
  }))

}





function validatePresence (name, incident, errors) {
  if (incident[name] === undefined || incident[name] === null) {
    errors.push({message: `Absent value for ${name}.`, incident: incident})
  }
  else {
    return incident[name]
  }
}

function validateNumeric (name, incident, errors) {
  const numericData = parseFloat(incident[name])
  
  if (isNaN(numericData)) {
    errors.push({message: `Bad numeric value for ${name}.`, incident: incident})
  }
  else {
    return numericData
  }
}

function validateIdInSet (name, incident, set, errors) {
  if (set.get(incident[name]) === undefined) {
    errors.push({message: `Value for ${name} not in schema.`, incident: incident})
  }
  else {
    return incident[name]
  }
}

function validateListIdsInSet (name, incident, set, errors) {
  let items
  try {
    items = incident[name].split(',')
  }
  catch (e) {
    errors.push({message: `Absent value for ${name}`, incident: incident})
    return
  }

  for (const item of items) {
    if (set.get(item) === undefined) {
      errors.push({message: `List value ${item} for ${name} not in schema.`, incident: incident})
      return
    }
  }

  return items
}

function validateBoolean (name, incident, errors) {
  if (incident[name] === true || incident[name] === false) {
    return incident[name]
  }
  else {
    errors.push({message: `Non-boolean value for ${name}`, incident: incident})
  }
}

function validateDate (name, incident, errors) {
  const date = Moment(incident[name])

  if (date.isValid()) {
    return date
  } 
  else {
    errors.push({message: `Bad date value for ${name}`, incident: incident})
  }
}

function validateVolumeCategory(incident, errors) {

  const volumeString = incident.ApproximateVolumeM3

  if (volumeString === 'Not Applicable') {
    return '1'
  }
  else if (volumeString === 'Not Provided') {
    return '2'
  }

  const volume = parseFloat(volumeString)
  
  if (isNaN(volume) || volume < 0) {
    errors.push({message: 'Bad numeric volume', incident: incident})
    return
  }

  if (volume < 1) {
    // 'Less Than 1 m³'
    return '3'
  }
  else if (volume < 1000) {
    // '1 m³ to 1,000 m³'
    return '4'
  } 
  else if (volume < 1000000) {
    // '1,000 m³ to 1,000,000 m³'
    return '5'
  }
  else {
    // 'More than 1,000,000 m³'
    return '6'
  }

}



const DataLoader = {

  // Load the application data from a single remote CSV file
  loadDataCsv (store) {

    const appRoot = RouteComputations.appRoot(document.location, store.getState().language)

    const options = {
      uri: `${appRoot}data/2017-09-13 ERS TEST-joined.csv`,
    }

    Request(options)
      .then(function (response) {
        const data = D3.csvParse(response.body.toString(), csvColumnMapping)

        afterLoad(store, data)

      })
      .catch(function (error) {
        throw error
      })

  },


  // Load the application data from the data service.
  loadFromDataService (store) {

    const appRoot = RouteComputations.appRoot(document.location, store.getState().language)

    const schemaOptions = {
      uri: `${appRoot}data/CategorySchema.json`,
      json: true
    }

    const schemaPromise = Request(schemaOptions)
      .then( response => {
        const schema = Immutable.fromJS(response.body)
        store.dispatch(SetSchemaCreator(schema))
        return schema
      })

    const dataOptions = {
      // TODO: This should be replaced with the location of the NEB's data
      // service
      uri: `${appRoot}data/data-dummy.json`,
      json: true
    }

    const dataRequest = Request(dataOptions)

    Promise.join(schemaPromise, dataRequest)
      .then(function ([schema, dataResponse]) {

        const incidents = [] 

        for (const incident of dataResponse.body) {

          const errors = []

          const incidentRecord = {
            incidentNumber: validatePresence('IncidentNumber', incident, errors),
            nearestPopulatedCentre: validatePresence('NearestPopulationCenter_EN', incident, errors),

            latitude: validateNumeric('Latitude', incident, errors),
            longitude: validateNumeric('Longitude', incident, errors),
            approximateVolumeReleased: validateNumeric('ApproximateVolumeM3', incident, errors),

            affectsCompanyProperty: validateBoolean('AffectsCompanyProperty', incident, errors),
            offCompanyProperty: validateBoolean('OffCompanyProperty', incident, errors),
            affectsPipelineRightOfWay: validateBoolean('AffectsPipelineRightOfWay', incident, errors),
            affectsOffPipelineRightOfWay: validateBoolean('AffectsOffPipelineRightOfWay', incident, errors),

            reportedDate: validateDate('ReportedDate', incident, errors),
            year: validatePresence('ReportedYear', incident, errors),

            status: validateIdInSet('Status_ID', incident, schema.get('status'), errors),
            company: validateIdInSet('Company_ID', incident, schema.get('company'), errors),
            province: validateIdInSet('Province_ID', incident, schema.get('province'), errors),
            substance: validateIdInSet('Substance_ID', incident, schema.get('substance'), errors),
            pipelinePhase: validateIdInSet('PipelinePhase_ID', incident, schema.get('pipelinePhase'), errors),

            incidentTypes: validateListIdsInSet('IncidentType_ID_LIST', incident, schema.get('incidentTypes'), errors),
            whatHappened: validateListIdsInSet('WhatHappened_ID_LIST', incident, schema.get('whatHappened'), errors),
            whyItHappened: validateListIdsInSet('WhyItHappened_ID_LIST', incident, schema.get('whyItHappened'), errors),
            pipelineSystemComponentsInvolved: validateListIdsInSet('PipelineComponent_ID_LIST', incident, schema.get('pipelineSystemComponentsInvolved'), errors),


            // TODO: change this depending how volume category works out from
            // our endpoint
            volumeCategory: validateVolumeCategory(incident, errors),

            // TODO: change this depending how release type works out
            releaseType: validateIdInSet('ReleaseType', incident, schema.get('releaseType'), errors),



            // TODO: will it be yes/no, t/f, 0,1, what? 
            // TODO: unused, and unclear if needed... 
            // werePipelineSystemComponentsInvolved: 
            // substanceCategory

          }

          if(errors.length > 0) {
            console.warn('Incident record with errors:', incident, errors)
          }
          else {
            incidents.push(incidentRecord)
          }

        }

        afterLoad(store, Immutable.fromJS(incidents))

      })
      .catch(function (error) {
        // TODO: something nicer than this ...
        throw error
      })


    
  }


}












window.dl = DataLoader


module.exports = DataLoader

