const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const bcrypt = require('bcryptjs');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/events');
const User = require('./models/user');

require('dotenv').config();

const app = express();

const events = [];

app.use(bodyParser.json());

const event = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
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
      return { ...user._doc, _id: user.id, createdEvents: event.bind(this, user.createdEvents) }
    })
    .catch(err => {
      throw err;
    })
}

app.use('/graphql', graphqlHttp({
  schema: buildSchema(`

  type Event{
    _id: ID!
    title:String!
    description:String!
    price:Float!
    date: String!
    creator: User!
  }
  type User{
    _id:ID!
    email:String!
    password:String
    createdEvents:[Event!]
  }

  input UserInput{
    email:String!
    password:String!
  }
  input EventInput{
    title:String!
    description:String!
    price:Float!
    date:String!
  }
  type RootQuery{
    events: [Event!]!
  }
  type RootMutation{
    createEvent(eventInput:EventInput):Event
    createUser(userInput:UserInput):User
  }
  schema{
    query:RootQuery
    mutation:RootMutation
  }
  `),
  rootValue: {
    events: () => {
      return Event.find()
        .then(events => {
          return events.map(event => {
            return { ...event._doc, _id: event.id, creator: user.bind(this, event._doc.creator) }
          })
        }).catch(err => {
          throw err;
        });
    },
    createEvent: (args) => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: '5d640ba6dda316e2b120b504'
      });
      let createdEvents;
      return event
        .save()
        .then(result => {
          createdEvents = { ...result._doc }
          return User.findById('5d640ba6dda316e2b120b504');
        })
        .then(user => {
          if (!user) {
            throw new Error('User not found.');
          }
          user.createdEvents.push(event);
          return user.save();
        })
        .then(result => {
          return createdEvents;
        })
        .catch(err => {
          console.log(err)
          throw err;
        }
        );
    },
    //! we return when we need funcs to be async and are waited 
    createUser: (args) => {
      return User.findOne({
        email: args.userInput.email
      })
        .then(user => {
          if (user) {
            throw new Error('User exists already.')
          }
          return bcrypt.hash(args.userInput.password, 12)
        })
        .then(hashedPassword => {
          const user = new User({
            email: args.userInput.email,
            password: hashedPassword
          });
          return user.save()
            .then(result => {
              return { ...result._doc, password: null }
            })
        })
        .catch(err => {
          throw err;
        });
    }
  },
  graphiql: true
}));

const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, { auth: { user: process.env.DB_USER, password: process.env.DB_PASS }, useNewUrlParser: true })
  .then(app.listen(port))
  .catch(err => {
    console.log(err);
  });


