const React = require('react')
const ReactRedux = require('react-redux')

const Constants = require('../Constants.js')
const ResetVisualizationCreator = require('../actionCreators/ResetVisualizationCreator.js')
const DefaultCategoryComputations = require('../DefaultCategoryComputations.js')
const Tr = require('../TranslationTable.js')
const WorkspaceComputations = require('../WorkspaceComputations.js')

require('./Header.scss')


class Header extends React.Component {

  tellMeAStoryClick() {
    
  }

  aboutThisProjectClick() {

  }

  methodologyClick() {

  }

  resetAllClick() {
    const categories = DefaultCategoryComputations.initialState(this.props.data)
    this.props.resetVisualization(categories)
  }



  leftHeading() {
    const leftHeadingStyle = {
      position: 'absolute',
      left: `${0}px`,
      top: `${0}px`,
    }
    
    return <div style = { leftHeadingStyle }>
      
    </div>
  }


  rightButtons() {


    const socialBarMeasurements = WorkspaceComputations.socialBarMeasurements(this.props.viewport)

    let transformContainer = `translate(${socialBarMeasurements.get('x') - Constants.getIn(['socialBar', 'iconSideMargin'])}, 0)`

    let transformButtons = `translate(${Constants.getIn(['socialBar', 'iconSideMargin'])}, ${Constants.getIn(['socialBar', 'iconSideMargin'])})`
    
    let transformText = `translate(0, ${Constants.getIn(['socialBar', 'iconSideMargin'])})`


    return <svg
      width = { this.props.viewport.get('x')}
      height = { Constants.getIn(['topBar', 'height'])}
    >
      <g transform = { transformContainer }>

        <rect
          width = { Constants.getIn(['socialBar', 'width']) }
          height = { Constants.getIn(['headerBar', 'height']) }
          x = { Constants.getIn(['socialBar', 'iconSideMargin']) }
          className = 'headerBarBackground'
        />

        <g transform = { transformText }>
          <text
            className = 'headerButtonLabel'
            y = { Constants.getIn(['headerBar', 'tellMeAStoryHeight']) + Constants.getIn(['headerBar', 'headerLabelFontSize'])}
            fontSize = { Constants.getIn(['headerBar', 'headerLabelFontSize'])}
            onClick = { this.tellMeAStoryClick.bind(this) }
          >{ Tr.getIn(['tellMeAStory', this.props.language]).toUpperCase() }</text>
          <text
            className = 'headerButtonLabel'
            y = { Constants.getIn(['headerBar', 'aboutThisProjectHeight']) + Constants.getIn(['headerBar', 'headerLabelFontSize']) }
            fontSize = { Constants.getIn(['headerBar', 'headerLabelFontSize'])}
            onClick = { this.aboutThisProjectClick.bind(this) }
          >{ Tr.getIn(['aboutThisProject', this.props.language]).toUpperCase() }</text>
          <text
            className = 'headerButtonLabel'
            y = { Constants.getIn(['headerBar', 'methodologyHeight']) + Constants.getIn(['headerBar', 'headerLabelFontSize']) }
            fontSize = { Constants.getIn(['headerBar', 'headerLabelFontSize'])}
            onClick = { this.methodologyClick.bind(this) }
          >{ Tr.getIn(['methodology', this.props.language]).toUpperCase() }</text>
          <text
            className = 'headerButtonLabel'
            y = { Constants.getIn(['headerBar', 'resetAllHeight']) + Constants.getIn(['headerBar', 'headerLabelFontSize']) }
            fontSize = { Constants.getIn(['headerBar', 'headerLabelFontSize'])}
            onClick = { this.resetAllClick.bind(this) }
          >{ Tr.getIn(['resetAll', this.props.language]).toUpperCase() }</text>

        </g>

        <g transform = { transformButtons }>

          <image 
            className = 'headerButton'
            height = {Constants.getIn(['socialBar', 'iconSize']) }
            width = {Constants.getIn(['socialBar', 'iconSize']) }
            y = { Constants.getIn(['headerBar', 'tellMeAStoryHeight'])}
            x = { Constants.getIn(['socialBar', 'iconSideMargin']) }
            onClick = { this.tellMeAStoryClick.bind(this) }
            xlinkHref = 'images/methodology-icon-white.svg'
          ></image>

          <image 
            className = 'headerButton'
            height = {Constants.getIn(['socialBar', 'iconSize']) }
            width = {Constants.getIn(['socialBar', 'iconSize']) }
            y = { Constants.getIn(['headerBar', 'aboutThisProjectHeight'])}
            x = { Constants.getIn(['socialBar', 'iconSideMargin']) }
            onClick = { this.aboutThisProjectClick.bind(this) }
            xlinkHref = 'images/methodology-icon-white.svg'
          ></image>

          <image 
            className = 'headerButton'
            height = {Constants.getIn(['socialBar', 'iconSize']) }
            width = {Constants.getIn(['socialBar', 'iconSize']) }
            y = { Constants.getIn(['headerBar', 'methodologyHeight'])}
            x = { Constants.getIn(['socialBar', 'iconSideMargin']) }
            onClick = { this.methodologyClick.bind(this) }
            xlinkHref = 'images/methodology-icon-white.svg'
          ></image>

          <image 
            className = 'headerButton'
            height = {Constants.getIn(['socialBar', 'iconSize'])}
            width = {Constants.getIn(['socialBar', 'iconSize'])}
            y = { Constants.getIn(['headerBar', 'resetAllHeight'])}
            x = { Constants.getIn(['socialBar', 'iconSideMargin']) }
            onClick = { this.resetAllClick.bind(this) }
            xlinkHref = 'images/reset_button-white.svg'
          ></image>

        </g>

      </g>
    </svg>
  }


  render() {


    return <div>
      { this.leftHeading() }
      { this.rightButtons() }
    </div>



  }
}

const mapStateToProps = (state) => { 
  return {
    data: state.data,
    language: state.language,
    viewport: state.viewport,
  } 
}

const mapDispatchToProps = dispatch => {
  return {
    resetVisualization: (categories) => {
      dispatch(ResetVisualizationCreator(categories))
    }
  }
}

module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Header)