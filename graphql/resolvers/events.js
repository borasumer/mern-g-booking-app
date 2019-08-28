const Event = require('../../models/events');
const { transformEvent } = require('./merge');


module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return transformEvent(event);
      })
    } catch (err) {
      throw err;
    };
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated');
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5d640ba6dda316e2b120b504'
    });
    let createdEvents;
    try {
      const result = await event
        .save()
      createdEvents = transformEvent(result);
      const creator = await User.findById('5d640ba6dda316e2b120b504');
      if (!creator) {
        throw new Error('User not found.');
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvents;
    } catch (err) {
      throw err;
    }
  }
};
