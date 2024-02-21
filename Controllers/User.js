const asyncHandler = require("express-async-handler");
const User = require("../Models/User");
const generateToken = require("../config/generateToken");
const { uploadImageToCloudinary } = require("../utils/imageUploader");



const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});


const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const Picture = req.files?.pic;
  if (!name || !email || !password) {
    res.status(400).send("Please enter all the fields");
    return; // Return to exit the function after sending response
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).send("User already exists");
    return; // Return to exit the function after sending response
  }

  let userData = { name, email, password }; // Simplified userData assignment
  if (Picture) {
    const upimage = await uploadImageToCloudinary(Picture, process.env.FOLDER); // Corrected parameters passed to uploadImageToCloudinary
    userData.pic = upimage.secure_url;
  }
  

  const newUser = new User(userData); // Create new user instance
  await newUser.save(); // Save the user to the database

  res.status(201).json({ newUser }); // Send response with the newly created user
});



const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

module.exports = {allUsers,  registerUser, authUser };