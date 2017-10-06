
const React = require('react')
const ReactRedux = require('react-redux')

require('./ColumnTooltip.scss')

const Constants = require('../Constants.js')
const Tr = require('../TranslationTable.js')
const WorkspaceComputations = require('../WorkspaceComputations.js')
const DisclaimerDismissedCreator = require('../actionCreators/DisclaimerDismissedCreator.js')

class ColumnTooltip extends React.Component {

  closeButtonClick() {
    this.props.disclaimerDismissed()
  }

  title() {
    return <p
      className='PopupHeading'>
      {Tr.getIn(['tooltips', this.props.columnTooltip.get('columnName'), 'title', this.props.language])}
    </p>
  }

  description() {
    return <p
      className='PopupOverview'>
      {Tr.getIn(['tooltips', this.props.columnTooltip.get('columnName'), 'description', this.props.language])}
    </p>
  }

  separator() {
    return <hr className='separator'/>
  }

  listSymbol(item) {
    let sym = '+'
    if(item.get('expanded') === null) sym = ''
    return <span
      className='PopupPlusSign'>
      {sym}
    </span>
  }

  listText() {
    const items = Tr.getIn(['tooltips', this.props.columnTooltip.get('columnName'), 'detail', this.props.language])
    return items.map(item => {
      return <p style={{marginBottom:'-10px'}}>
        {this.listSymbol(item)}
        <span className='PopupText'>
          {item.get('overview')}
        </span>
      </p>
    })
  }

  tooltipY() {
    return WorkspaceComputations.topBarHeight() + 
      Constants.getIn(['questionMark', 'yOffset'])
  }

  tooltipX() {
    const columnMeasurements = WorkspaceComputations.horizontalPositions(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories)

    if(this.props.columnTooltip.get('columnName') === 'pinColumn')
      return columnMeasurements.get('pinColumn').get('x')
    else
      return columnMeasurements.getIn(['columns', this.props.columnTooltip.get('columnName')]).get('x')
  }

  tooltipStyle() {
    return {
      top:this.tooltipY(),
      left:this.tooltipX(),
    }
  }

  render() {
    // Only render if a tooltip has been summoned
    if(!this.props.columnTooltip.get('isActive')) return null

    return <div 
      className='tooltip'
      style={this.tooltipStyle()}>
      {this.title()}
      {this.description()}
      {this.separator()}
      <div className='listContainer'>
        {this.listText()}
      </div>
    </div>
  }
}

const mapStateToProps = state => {
  return {
    language: state.language,
    viewport: state.viewport,
    showEmptyCategories: state.showEmptyCategories,
    data: state.data,
    columns: state.columns,
    categories: state.categories,
    columnTooltip: state.columnTooltip,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    disclaimerDismissed: () => {
      dispatch(DisclaimerDismissedCreator())
    }
  }
}

module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(ColumnTooltip)