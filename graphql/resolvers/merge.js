const Event = require('../../models/events');
const User = require('../../models/user');
const { dateToString } = require("../../helpers/date");



const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator)
  };
};

const transformBooking = booking => {
  return {
    ...booking._doc, _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  }
};

const userEvents = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          //! we create a function above and set its value to creator
          ...event._doc, creator: user.bind(this, event.creator)
        }
      })
    })
    .catch(err => {
      throw err;
    })
}
const user = userId => {
  return User.findById(userId)
    .then(user => {
      //! we create a function and set its value to createdEvents
      return { ...user._doc, createdEvents: userEvents.bind(this, user.createdEvents) }
    })
    .catch(err => {
      throw err;
    })
}
const singleEvent = async eventId => {
  const event = await Event.findById(eventId);
  return transformEvent(event);
}

exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;
