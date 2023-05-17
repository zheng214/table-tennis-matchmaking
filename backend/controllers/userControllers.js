const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic, availability, level, location } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please Enter all Fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
    location,
    availability,
    level,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      location: user.location,
      level: user.level,
      availability: user.availability,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Failed to create user');
  }
})

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      location: user.location,
      availability: user.availability,
      level: user.level,
      token: generateToken(user._id),
    })
  } else {
    res.status(401);
    throw new Error('Invalid Email or Password');
  }
});

// /api/user?search=montreal
const allUsers = asyncHandler(async (req, res) => {
  try {
    let { search } = req.query;
    search = search.replace(/[^a-z0-9\-\']/gi, '');
    if (!search) {
      return res.send([])
    }
    const pipeline = [];
    pipeline.push(
      {
        $search: {
          index: 'default',
          text: {
            query: search,
            path: ['location'],
            fuzzy: {},
          }
        }
      }
    );
    pipeline.push({
      $unionWith: {
        coll: 'users',
        pipeline: [
          {
            $match: {
              location: {
                $regex: search,
                $options: 'i'
              }
            }
          }
        ]
      }
    });
    pipeline.push({
      $match: {
        _id: { $not: { $eq: req.user._id } }      
      }
    });
    pipeline.push({ $group: { 
        _id: '$_id', 
        name: {
          $first: '$name'
        },
        pic: {
          $first: '$pic'
        },
        level: {
          $first: '$level'
        },
        availability: {
          $first: '$availability'
        },
        location: {
          $first: '$location'
        }
      }
    })
    const users = await User.aggregate(pipeline);
    res.send(users);
  } catch (error) {
    console.log({ error })
    res.send([])
  }
})

const editProfile = asyncHandler(async (req, res) => {
  const { location, availability, level, pic } = req.body;
  console.log(req.body)
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      location,
      availability,
      level,
      pic,
    }, {
      new: true,
    }
  )
  res.json(updatedUser);
})

const emailExists = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  res.status(200).json({ email });
});

function deburr(string) {
  return (string || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

module.exports = { registerUser, authUser, allUsers, editProfile, emailExists };