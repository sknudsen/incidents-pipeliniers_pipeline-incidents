const Immutable = require('immutable')




const defaultState = Immutable.Map()

// Manages the sets of active categories

const CategoriesReducer = (state = defaultState, action) => {

  switch(action.type) {

  case 'SetInitialCategoryState':
    console.log('here', action.state)
    return action.state
  default:
    return state
  }




}


module.exports = CategoriesReducer