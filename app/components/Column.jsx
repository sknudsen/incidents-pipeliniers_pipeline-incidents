const React = require('react')
const ReactRedux = require('react-redux')

const WorkspaceComputations = require('../WorkspaceComputations.js')
const CategoryComputations = require('../CategoryComputations.js')
const ColumnPaths = require('./ColumnPaths.jsx')
const Category = require('./Category.jsx')
const Constants = require('../Constants.js')
const TranslationTable = require('../TranslationTable.js')

require('./Column.scss')

// TODO: Get this from the URL query? Cookies? language reducer! 
const language = 'en'

class Column extends React.Component {

  // Specifically: non-empty AND visible categories
  nonEmptyCategories() {
    const categoryColours = CategoryComputations.coloursForColumn(
      this.props.categories,
      this.props.columnName)
    const categoryHeights = WorkspaceComputations.categoryHeights(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories, 
      this.props.columnName) 

    // TODO: I'm not very happy computing the vertical layout this way, refactor!
    let categoryY = WorkspaceComputations.columnY()

    const displayedCategories = CategoryComputations.displayedCategories(
      this.props.data,
      this.props.columns,
      this.props.categories, 
      this.props.columnName)

    const columnMeasurements = WorkspaceComputations.horizontalPositions(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories)
      .getIn(['columns', this.props.columnName])


    return displayedCategories
      .map( (visible, categoryName) => {
        const currentY = categoryY
        categoryY += categoryHeights.get(categoryName)

        return <Category
          categoryName={categoryName}
          key={categoryName}
          colour={categoryColours.get(categoryName)} 
          height={categoryHeights.get(categoryName)}
          width={ columnMeasurements.get('width') }
          x={ columnMeasurements.get('x') }
          y={currentY}
        />
      }).toArray()
  }

  barHeading() {
    let currentY = WorkspaceComputations.topBarHeight()

    // Check if the subheading is visible. If it is not, 
    // add Constants.get('columnSubheadingHeight') to currentY.
    if(CategoryComputations.columnFiltered(this.props.categories, this.props.columnName)) {
      currentY += Constants.get('columnSubheadingHeight')
    }

    const columnMeasurements = WorkspaceComputations.horizontalPositions(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories)
      .getIn(['columns', this.props.columnName])

    return  this.splitHeading().map((word) => {
      currentY += Constants.get('columnHeadingLineOffset')
      return <tspan className='barsHeading' 
        x={columnMeasurements.get('x')} 
        y={currentY}>
        {word}
      </tspan>
    })
  }

  barSubHeading() {
    // Only render the sub-heading if filters are on.
    if(CategoryComputations.columnFiltered(this.props.categories, this.props.columnName)) {
      return
    }

    const columnMeasurements = WorkspaceComputations.horizontalPositions(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories)
      .getIn(['columns', this.props.columnName])

    const currentY = WorkspaceComputations.topBarHeight() + 
                     Constants.get('columnSubheadingOffset')
    return <tspan className='barsSubHeading' 
      x={columnMeasurements.get('x')} 
      y={currentY}>
      578/1017 shown
    </tspan>
  }

  dragArrow() {

    const columnMeasurements = WorkspaceComputations.horizontalPositions(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories)
      .getIn(['columns', this.props.columnName])

    return <image xlinkHref='images/horizontal_drag.svg' 
      height = {Constants.getIn(['dragArrow', 'height'])}
      width = {Constants.getIn(['dragArrow', 'width'])}
      x= {WorkspaceComputations.dragArrowX(this.props.columns, columnMeasurements.get('x'))}
      y= {WorkspaceComputations.dragArrowY(this.props.viewport)}>
    </image>
  }

  emptyCategories() {
    
    if (!this.props.showEmptyCategories) {
      // If not showing empty categories, bail out
      return null
    }


    const categoryColours = CategoryComputations.coloursForColumn(
      this.props.categories,
      this.props.columnName)

    const baselineHeight = WorkspaceComputations.baselineHeight(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories)

    const emptyCategoryHeight = WorkspaceComputations.emptyCategoryHeight(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories)

    const columnMeasurements = WorkspaceComputations.horizontalPositions(
      this.props.showEmptyCategories,
      this.props.viewport,
      this.props.data,
      this.props.columns,
      this.props.categories)
      .getIn(['columns', this.props.columnName])


    // TODO: I'm not very happy computing the vertical layout this way, refactor!
    let categoryY = baselineHeight

    return CategoryComputations.emptyCategoriesForColumn(
      this.props.data,
      this.props.columns,
      this.props.categories,
      this.props.columnName
    ).map( (visible, categoryName) => {
      // TODO: I think that we don't care whether an empty category is visible or not?
      const currentY = categoryY
      categoryY += emptyCategoryHeight

      return <Category
        categoryName={categoryName}
        key={categoryName}
        colour={categoryColours.get(categoryName)} 
        height={emptyCategoryHeight}
        width={ columnMeasurements.get('width') }
        x={ columnMeasurements.get('x') }
        y={currentY}
      />

    }).toArray()



  }

  columnPaths() {
    if (WorkspaceComputations.shouldRenderColumnPath(
      this.props.columns,
      this.props.columnName)) {
      return <ColumnPaths index={this.props.index} columnName={this.props.columnName}/>
    }
    else {
      return null
    }
    
  }



  render() {
    return <g>
      <text>
        {this.barHeading()}
        {this.barSubHeading()}
      </text>
      { this.nonEmptyCategories() }
      { this.emptyCategories() }
      { this.columnPaths() }
      { this.dragArrow() }
    </g>
  }

  splitHeading() {
    const columnHeading = TranslationTable.getIn(['columnHeadings', this.props.columnName, language])
    const splitIndex = columnHeading.lastIndexOf(' ')
    const topLine = columnHeading.substring(0, splitIndex)
    const bottomLine = columnHeading.substring(splitIndex+1)
    return [topLine, bottomLine]
  }
}

const mapStateToProps = state => {
  return {
    viewport: state.viewport,
    columns: state.columns,
    categories: state.categories,
    data: state.data,
    showEmptyCategories: state.showEmptyCategories
  }
}

module.exports = ReactRedux.connect(mapStateToProps)(Column)