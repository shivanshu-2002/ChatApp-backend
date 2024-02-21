// Import the required modules
const express = require("express")
const router = express.Router()


// Import the required controllers and middleware functions
const {
  authUser,
  registerUser,
  allUsers
} = require("../Controllers/User")
const { protect } = require("../Middleware/authMiddleware")


router.post("/login", authUser)
router.post("/signup", registerUser)
router.get("/allUsers",protect, allUsers) 




module.exports = router