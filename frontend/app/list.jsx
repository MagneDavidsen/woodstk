var React = require('react');
var Swing = require('swing');

var statistics = require('./js/statistics.js');
var rest = require('./js/rest.js');

var _ = require('underscore');

var ArtistList = React.createClass({
    stackConfig: {
        throwOutConfidence: function (offset, element) {
            return Math.min(Math.abs(offset) / (element.offsetWidth / 2), 1);
        }
    },

    stack: {},

    getInitialState: function() {
        return {swipes: 0, artists: this.props.initialArtists, cards: []};
    },

    render: function () {
      var swipes = this.state.swipes;
      var artists = this.state.artists;

      function styleIt(number) {
        return {backgroundImage: 'url(' + artists[number].imgUrl + ')', backgroundRepeat: 'no-repeat'}
      }

      var preloadQuantity = 10;
      var cards = _.range(preloadQuantity).map(function (i) {
        var index = preloadQuantity - i - 1 ;
        return (<li className="clubs" id={artists[swipes + index].id} style={styleIt(swipes + index)}>{artists[swipes + index].name}<div className="yes">:)</div>
          <div className="no">:(</div></li>);
      });

        return (<ul className="stack">{cards}</ul>);
    },
    componentDidMount: function () {
        var aModule = this;
        this.stack = Swing.Stack(this.stackConfig);

      var

        throwOutConfidenceElements = {};

      this.stack.on('dragstart', function (e) {
        throwOutConfidenceElements.yes = e.target.querySelector('.yes').style;
        throwOutConfidenceElements.no = e.target.querySelector('.no').style;
      });

      this.stack.on('dragmove', function (e) {
        throwOutConfidenceElements[e.throwDirection === Swing.Card.DIRECTION_RIGHT ? 'yes' : 'no'].opacity = e.throwOutConfidence/1.2;
      });

      this.stack.on('dragend', function (e) {
        if (e.throwOutConfidence != 1) {
          throwOutConfidenceElements.yes.opacity = 0;
          throwOutConfidenceElements.no.opacity = 0;
        }
      });

        console.log("comp did mount");

        // Create cards of all ul li elements
        [].slice.call(document.querySelectorAll('ul li')).forEach(function (targetElement) {
            // Add card element to the Stack.
            aModule.stack.createCard(targetElement);
        });

        // Add event listener for when a card is thrown out of the stack.
        this.stack.on('throwout', function (e) {
            // e.target Reference to the element that has been thrown out of the stack.
            // e.throwDirection Direction in which the element has been thrown (Card.DIRECTION_LEFT, Card.DIRECTION_RIGHT).

            var points = e.throwDirection === Swing.Card.DIRECTION_LEFT ? -1 : 1;
            rest.vote(e.target.id, points);

            var card = aModule.stack.getCard(e.target);

            e.target.style.transform = "none";
            e.target.style.webkitTransform = e.target.style.webkitTransform ? "none" : undefined;

            card.destroy();
            aModule.stack.createCard(e.target);

            aModule.setState({swipes: aModule.state.swipes + 1});

            console.log('Card has been thrown out of the stack.');
            console.log(aModule.state.swipes + ' cards have been thrown out of the stack.');
            console.log('Throw direction: ' + (e.throwDirection));
        });

// Add event listener for when a card is thrown in the stack, including the spring back into place effect.
        this.stack.on('throwin', function (e) {
            console.log('Card has snapped back to the stack.');
        });
    }
});

module.exports = React.createClass({
  render: function() {
    return (
      <div id="viewport">
        <ArtistList initialArtists={this.props.initialArtists} />
      </div>
    );
  }});
