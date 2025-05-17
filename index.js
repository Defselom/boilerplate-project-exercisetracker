const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const Database = require('./config/db');
const { userModel } = require('./schema/userSchema');
const { excerciceModel } = require('./schema/exerciseSchema');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))
const mongoose = require('mongoose');


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

(async () => {
  await Database.connect();
})();

app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.json({ error: "Username not found" })
  }

  let newUserName = new userModel({ username: username });

  newUserName = await newUserName.save();

  return res.json(newUserName)
});

app.get('/api/users', async (req, res) => {
  const users = await userModel.find();
  return res.json(users)
});


app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params;
  if (!_id) {
    return res.json({ error: "Id not found" })
  }
  // Check if _id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.json({ error: "Invalid Id format" });
  }

  const { description, duration, date } = req.body;
  if (!description || !duration) {
    return res.json({ error: "description and duration are required" })
  }

  if (!Number.parseInt(duration)) {
    return res.json({ error: "duration invalid" })
  }

  // check if user id exist 

  const existingUser = await userModel.findById(_id);

  if (!existingUser) {
    return res.json({ error: "User not found" })
  }


  const newExcercie = await excerciceModel.create(
    {
      userId: existingUser._id,
      description: description,
      date: date ?? null,
      duration: duration
    }
  );

  return res.json({
    _id: existingUser._id,
    username: existingUser.username,
    description: newExcercie.description,
    duration: newExcercie.duration,
    date: newExcercie.date ? new Date(newExcercie.date).toUTCString() : null
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
