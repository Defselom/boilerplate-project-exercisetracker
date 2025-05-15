const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const Database = require('./config/db');
const { userModel } = require('./schema/userSchema');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))

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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
