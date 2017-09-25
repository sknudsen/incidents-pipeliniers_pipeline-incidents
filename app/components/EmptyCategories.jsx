const React = require('react')
const ReactRedux = require('react-redux')

const Constants = require('../Constants.js')
const ShowHideEmptyCategoriesCreator = require('../actionCreators/ShowHideEmptyCategoriesCreator.js')
const WorkspaceComputations = require('../WorkspaceComputations.js')
const Tr = require('../TranslationTable.js')

require('../styles/Common.scss')


class EmptyCategories extends React.Component {

  showImage() {
    const height = Constants.getIn(['showHideEmptyCategories', 'showHideIconHeight'])
    const width = Constants.getIn(['showHideEmptyCategories', 'showHideIconWidth'])

    const transformShowImage = `translate(0, ${-Constants.getIn(['showHideEmptyCategories','fontSize'])})`

    if (this.props.showEmptyCategories) {
      return <image 
        height = {height} 
        width = {width} 
        transform = {transformShowImage} 
        xlinkHref='images/button-down.svg'></image>
    }
    else {
      return <image 
        height = {height} 
        width = {width} 
        transform = {transformShowImage} 
        xlinkHref='images/button-up.svg'></image>
    }
  }
  showText() {
    const xShowText = Constants.getIn(['showHideEmptyCategories', 'xShowText'])
    if (this.props.showEmptyCategories) {
      return <text x={xShowText} y={0} className="emptyCategories">
        <tspan>{ Tr.getIn(['hideEmptyCategories', this.props.language]) }</tspan>
      </text>

    }
    else {

      return <text x={xShowText} y={0} className="emptyCategories">
        <tspan>{ Tr.getIn(['seeEmptyCategories', this.props.language]) }</tspan>
      </text>
    }
  }


  render() {

    // TODO: previously, used baseline height. Unclear if we will permanently
    // move away from this logic. 
    // const yTransform = WorkspaceComputations.baselineHeight(
    //   this.props.showEmptyCategories,
    //   this.props.viewport,
    //   this.props.data, 
    //   this.props.columns,
    //   this.props.categories
    // ) - Constants.getIn(['showHideEmptyCategories', 'fontSize'])

    // TODO: it is a mystery to me why this fudge factor is needed to align
    // this with the drag arrows. 
    const yTransform = WorkspaceComputations.dragArrowY(this.props.viewport) + 
      Constants.get('emptyCategoryLabelFudgeFactor')

    // TODO: adapt empty categories to use horizontalComputations

    let transformShowHide = `translate(${Constants.get('showHideLeftMargin')}, ${yTransform})`
    return ( 
      <g transform = {transformShowHide} onClick={this.props.onClick}> 
        {this.showImage()}
        {this.showText()}
      </g>
    )
  }
}

const mapStateToProps = state => {
  return {
    showEmptyCategories: state.showEmptyCategories,
    viewport: state.viewport,
    data: state.data,
    columns: state.columns,
    categories: state.categories,
    language: state.language,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onClick: () => {
      dispatch(ShowHideEmptyCategoriesCreator())
    }
  }
}

module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(EmptyCategories)


