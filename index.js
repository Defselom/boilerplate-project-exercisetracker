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

  let formattedDate;
  if (!date) {
    formattedDate = new Date().toISOString().split('T')[0];
  } else {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: "Format de date invalide" });
    }
    formattedDate = dateObj.toISOString().split('T')[0];
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
      date: formattedDate,
      duration: Number(duration)
    }
  );

  return res.json({
    _id: existingUser._id,
    username: existingUser.username,
    description: newExcercie.description,
    duration: newExcercie.duration,
    date: new Date(newExcercie.date).toDateString()
  });
});


const validateDate = (dateString, paramName) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ${paramName} date format. Use yyyy-mm-dd`);
  }
  return date;
};
app.get('/api/users/:_id/logs', async (req, res) => {

  const { _id } = req.params;
  if (!_id) {
    return res.json({ error: "Id not found" })
  }
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.json({ error: "Invalid Id format" });
  }

  const { from, to, limit } = req.query;

  const existingUser = await userModel.findById(_id);

  if (!existingUser) {
    return res.json({ error: "User not found" })
  }

  const fromDate = validateDate(from, 'from');
  const toDate = validateDate(to, 'to');

  // 3. Validate Date Range Logic
  if (fromDate && toDate && fromDate > toDate) {
    return res.json({
      error: "'from' date cannot be after 'to' date"
    });
  }

  // 4. Validate Limit
  let limitNumber;
  if (limit) {
    limitNumber = parseInt(limit);
    if (isNaN(limitNumber)) {
      return res.json({ error: "Limit must be a number" });
    }
    if (limitNumber < 1) {
      return res.json({ error: "Limit must be positive" });
    }
  }

  // Build date filter
  const dateFilter = {};
  if (from) {
    dateFilter.$gte = new Date(from);
  }
  if (to) {
    dateFilter.$lte = new Date(to);
  }
  // Build query
  let query = excerciceModel.find({ userId: _id });

  if (from || to) {
    query = query.where('date').equals(dateFilter);
  }

  if (limit) {
    query = query.limit(parseInt(limit));
  }

  // Execute query
  const allUserExercises = await query.select('_id description duration date ').lean();

  const logs = allUserExercises.map(exo => ({
    description: exo.description,
    duration: exo.duration,
    date: new Date(exo.date).toDateString()
  }));

  return res.json({
    username: existingUser.username,
    _id: existingUser._id,
    count: allUserExercises.length,
    log: logs,
  });

});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
