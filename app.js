const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');
const isAuth = require('./middleware/is-auth');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors());

app.use(bodyParser.json());

const userEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } })
    return events.map(event => {
      return {
        //! we create a function above and set its value to creator
        ...event._doc, creator: user.bind(this, event.creator), date: new Date(event._doc.date).toISOString()
      }
    });
  } catch (err) {
    throw err;
  };
}
const user = async userId => {
  try {
    const user = await User.findById(userId)
    //! we create a function and set its value to createdEvents
    return { ...user._doc, createdEvents: userEvents.bind(this, user.createdEvents) }
  } catch (err) {
    throw err;
  }
}

app.use(isAuth); //!middleware function for authentiation for every incoming request

app.use('/graphql', graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolvers,
  graphiql: true
}));

const port = process.env.PORT || 8000;
mongoose.connect(process.env.DB_URI, { auth: { user: process.env.DB_USER, password: process.env.DB_PASS }, useNewUrlParser: true })
  .then(app.listen(port))
  .catch(err => {
    console.log(err);
  });


