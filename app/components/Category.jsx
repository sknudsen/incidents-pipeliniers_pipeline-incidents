const React = require('react')
const ReactRedux = require('react-redux')

const Constants = require('../Constants.js')
const Tr = require('../TranslationTable.js')

const BeginIncidentDragCreator = require('../actionCreators/BeginIncidentDragCreator.js')
const UpdateIncidentDragCreator = require('../actionCreators/UpdateIncidentDragCreator.js')
const EndIncidentDragCreator = require('../actionCreators/EndIncidentDragCreator.js')
const IncidentSelectionStateCreator = require('../actionCreators/IncidentSelectionStateCreator.js')

const IncidentComputations = require('../IncidentComputations.js')

const COLUMN_TYPE = {
  SIDEBAR: 'SIDEBAR',
  WORKSPACE: 'WORKSPACE'
}

class Category extends React.Component {

  // Do not render category labels for sidebar columns.
  label() {
    if(this.props.columnType === COLUMN_TYPE.SIDEBAR) {
      return null
    }

    const labelLines = this.labelLines()
    if(labelLines.length * Constants.get('singleLineCategoryLabelHeight') > this.props.height) {
      return null
    }

    let currentY = this.props.height/2
    let lineCount = 0
    // When labelLines.length = 1 => currentY += Constants.get('singleLineCategoryLabelHeight')/2 
    // When labelLines.length = 2 => currentY won't change
    // When labelLines.length = 3 => currentY -= Constants.get('singleLineCategoryLabelHeight')/2
    currentY += (1 - labelLines.length*0.5) * Constants.get('singleLineCategoryLabelHeight')

    // Decrement just before it's increcemented inside the map.
    currentY -= Constants.get('singleLineCategoryLabelHeight')

    return labelLines.map((line) => {
      currentY += Constants.get('singleLineCategoryLabelHeight')
      lineCount += 1
      return <tspan className='activeCategoryLabels'
        key={this.props.categoryName + 'CategoryLabelLine' + lineCount}
        y={currentY}
        x={this.props.width + Constants.get('categoryLabelOffset')}>
        {line}
      </tspan>
    })
  }

  handleOnMouseDown() {
    this.props.onBeginDrag(this.props.columnName, this.props.categoryName)
  }
  handleOnMouseMove(event) {
    if (this.props.incidentDragState.get('currentlyDragging')) {
      this.props.onUpdateDrag(this.props.columnName, this.props.categoryName)

      const bounds = this.rect.getBoundingClientRect()
      const localY = event.clientY - bounds.top

      const filteredIncidents = IncidentComputations.filteredIncidents(
        this.props.data,
        this.props.columns,
        this.props.categories
      )

      const categoryIncidents = IncidentComputations.categorySubset(
        filteredIncidents,
        this.props.columnName,
        this.props.categoryName
      )

      const categoryHeightFraction = localY / bounds.height
      const incidentIndex = Math.round(categoryHeightFraction * categoryIncidents.count())

      const incident = categoryIncidents.get(incidentIndex)

      if (typeof incident !== 'undefined') {
        this.props.selectIncident(incident)
      }

    }
  }
  handleOnMouseUp() {
    this.props.onEndDrag()
  }



  render() {
    const transformString = `translate(${this.props.x}, ${this.props.y})`

    // TODO: data-cat attribute is for dev purposes only, delete later!
    return <g transform={transformString}>
      <rect
        width={this.props.width}
        height={this.props.height}
        fill={this.props.colour}
        data-cat={this.props.categoryName}

        onMouseDown={this.handleOnMouseDown.bind(this)}
        onMouseUp={this.handleOnMouseUp.bind(this)}
        onMouseMove={this.handleOnMouseMove.bind(this)}

        ref={ (element) => this.rect = element }
      />
      <text>
        {this.label()}
      </text>
    </g>
  }

  labelLines() {

    switch(this.props.columnName) {
    case 'incidentTypes':
    case 'status':
    case 'province':
    case 'substance':
    case 'releaseType':
    case 'whatHappened':
    case 'whyItHappened':
    case 'pipelinePhase':
    case 'volumeCategory':
    case 'substanceCategory':
    case 'pipelineSystemComponentsInvolved': { 
      // These columns draw category names from a defined vocabulary
      const label = Tr.getIn([
        'categories', 
        this.props.columnName, 
        this.props.categoryName, 
        this.props.language
      ])
      return this.splitHeading(label.toUpperCase())
    }
    case 'company':
    case 'year':
      // These columns use the category name directly
      // Years are numbers, and we need a string here
      return this.splitHeading(this.props.categoryName.toString())

    // No categories for map column
    }
  }

  splitHeading(label) {

    // No need to split into multiple lines.
    if(label.length <= Constants.get('categoryLabelLineLength')) {
      return [label]
    }

    // Split (on spaces or dashes) right at the maxmium allows characters per line.
    // Case 1: split right at the line length limit.
    if(label[Constants.get('categoryLabelLineLength')] === ' ' || 
       label[Constants.get('categoryLabelLineLength')] === '-') {
      return [this.splitHeading(label.substring(0,Constants.get('categoryLabelLineLength')))].concat( 
        this.splitHeading(label.substring(Constants.get('categoryLabelLineLength') + 1)))
    }

    // Case 2: split at the closest space or dash.
    let firstLineSplitPoint = label.substring(0, Constants.get('categoryLabelLineLength')).lastIndexOf(' ')
    if(firstLineSplitPoint < 0) {
      firstLineSplitPoint = label.substring(0, Constants.get('categoryLabelLineLength')).lastIndexOf('-')
    }

    return [this.splitHeading(label.substring(0, firstLineSplitPoint))].concat( 
      this.splitHeading(label.substring(firstLineSplitPoint + 1)))
  }
}

const mapStateToProps = state => {
  return {
    language: state.language,
    incidentDragState: state.incidentDragState,
    data: state.data,
    columns: state.columns, 
    categories: state.categories,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onBeginDrag: (columnName, categoryName) => {
      dispatch(BeginIncidentDragCreator(columnName, categoryName))
    },
    onUpdateDrag: (columnName, categoryName) => {
      dispatch(UpdateIncidentDragCreator(columnName, categoryName))
    },
    onEndDrag: () => {
      dispatch(EndIncidentDragCreator())
    },
    selectIncident: (incident) => {
      dispatch(IncidentSelectionStateCreator(incident))
    }
  }
}


module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Category)
