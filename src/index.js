swby.lang.namespace('swby.index');

/**
@constructor
@extends {swby.base.Page}
 */
swby.index.Page = function() {
  swby.base.Page.call(this);
  /** @private {Element} */
  this.container_ = swby.util.getElementByClassName(document, 'container');
  this.listen(this.container_, 'click', this.handleContainerClick_);
  /** @private {Array.<EventProposals>} */
  this.eventProposals_ = [];
};
swby.lang.inherits(swby.index.Page, swby.base.Page);

/**
 */
swby.index.Page.prototype.init = function() {
  gapi.client.nextdoor.proposals.get({'calendarId': 'vtst@google.com'}).then(function(resp) {
    this.setEventsProposals_(resp.result.userSettings, resp.result.proposals  || []);      
    this.loaded();
  }, swby.base.apiErrorHandler("Cannot get proposals", true), this);
}

/**
@param {UserSettings} userSettings
@param {Array.<EventProposals>} eventProposals
@private
 */
swby.index.Page.prototype.setEventsProposals_ = function(userSettings, eventsProposals) {
  this.eventsProposals_ = eventsProposals;
  eventsProposals.forEach(function(eventProposals) {
    eventProposals.event.when = swby.util.formatEventWhen(eventProposals.event.start, eventProposals.event.end);
  });
  
  this.container_.innerHTML = '';
  this.container_.appendChild(soy.renderAsElement(swby.templates.eventsProposals, {
      eventsProposals: eventsProposals,
      sendWeeklyEmail: userSettings.sendWeeklyEmail,
      newUser: userSettings.newUser
  }));
};

/**
 */
swby.index.Page.prototype.getSelectedEventsProposals_ = function() {
  var selectedEventsProposals = [];
  var eventDivs = this.container_.getElementsByClassName('event');
  swby.util.forEach2(this.eventsProposals_, eventDivs, function(eventProposals, eventDiv) {
    var selectedEventProposals = [];
    var proposalDivs = eventDiv.getElementsByClassName('proposal');
    swby.util.forEach2(eventProposals.proposals, proposalDivs, function(eventProposal, proposalDiv) {
      var selectedEventProposal = {
          selected: !proposalDiv.classList.contains('proposal-rejected'),
          replacementRooms: []
      };
      if (selectedEventProposal.selected) {
        if (eventProposal.type == 'REPLACE') {
          var calendarId = swby.util.getSelectValue(swby.util.getElementByClassName(proposalDiv, 'proposal-replacement-room'));
          eventProposal.replacementRooms.forEach(function(room) {
            if (room.calendarId == calendarId) selectedEventProposal.replacementRooms.push(room);
          });
        }
      }
      selectedEventProposals.push(selectedEventProposal);
    }, this);
    selectedEventsProposals.push({selectedEventProposals: selectedEventProposals});
  }, this);
  return selectedEventsProposals;
};

/**
@param {boolean} disabled
 */
swby.index.Page.prototype.setDisabled_ = function(disabled) {
  var zhis = this;
  function setDisabled(tagName) {
    var inputs = zhis.container_.getElementsByTagName(tagName);
    for (var i = 0; i < inputs.length; ++i) {
      var input = inputs[i];
      input.disabled = disabled;
    }
  }
  setDisabled('input');
  setDisabled('button');
};


/**
@param {Event} event
@private
*/
swby.index.Page.prototype.handleContainerClick_ = function(event) {
  if (event.target.disabled) return;
  if (event.target.classList.contains('proposal-checkbox')) {
    var proposal = swby.util.getAncestorByClass(event.target, 'proposal');
    if (event.target.checked) {
      proposal.classList.remove('proposal-rejected');
    } else {
      proposal.classList.add('proposal-rejected');
    }
  } else if (event.target.classList.contains('apply-proposals')) {
    var selectedEventsProposals = this.getSelectedEventsProposals_();
    this.container_.classList.add('events-applying');
    this.setDisabled_(true);
    gapi.client.nextdoor.proposals.apply({
      'eventsProposals': this.eventsProposals_,
      'selectedEventsProposals': selectedEventsProposals
    }).then(function(resp) {
      this.container_.classList.remove('events-applying');
      this.setDisabled_(false);
      var eventDivs = this.container_.getElementsByClassName('event');
      swby.util.forEach3(resp.result.statuses, selectedEventsProposals, eventDivs, function(status, selectedEventProposals, eventDiv) {
        var proposalDivs = eventDiv.getElementsByClassName('proposal');
        swby.util.forEach2(selectedEventProposals.selectedEventProposals, proposalDivs, function(selectedEventProposal, proposalDiv) {
          if (selectedEventProposal.selected) {
            proposalDiv.classList.add(status.success ? 'proposal-success' : 'proposal-error');
          }
        });
      });
    }, swby.base.apiErrorHandler("Cannot apply proposals", true), this);
  } else if (event.target.classList.contains('settings-send-weekly-email')) {
    gapi.client.nextdoor.user.setSettings({'sendWeeklyEmail' : event.target.checked}).then(function(resp) {
    }, swby.base.apiErrorHandler("Cannot change settings"), this);
  } else if (event.target.classList.contains('proposal-feedback')) {
    var event = swby.util.getAncestorByClass(event.target, 'event');
    var index = parseInt(event.getAttribute('data-index'), 10);
    var eventProposals = this.eventsProposals_[index];
    var message = prompt('What\'s up?');
    if (message) {
      gapi.client.nextdoor.proposals.feedback({
        'eventProposals': eventProposals,
        'feedback': {'message': message}
      }).then(function(resp) {});
    }
  }
};

swby.base.init(swby.index.Page);
