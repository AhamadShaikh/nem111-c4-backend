const express = require("express");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const BlacklistToken = require("../model/blacklist");

const router = express.Router()


router.post("/register", async (req, res) => {
    const { name, email, gender, password } = req.body
    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(200).json({ msg: "User already exists" })
        }

        const newPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ ...req.body, password: newPassword })

        await newUser.save();

        res.status(200).json({ msg: "User registered successfully", user: newUser })

    } catch (error) {
        res.status(400).json({ msg: "Internal Server Error" })
    }
})

router.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({ msg: "Wrong Credentials" })
        }

        const verifyPassword = await bcrypt.compare(password, user.password);

        if (!verifyPassword) {
            res.status(400).json({ msg: "Wrong Credentials" })
        }

        const token = jwt.sign({ userId: user._id, name: user.name }, "thor", { expiresIn: "1d" })

        const refreshToken = jwt.sign({ userId: user._id, name: user.name }, "thor", { expiresIn: "1d" })

        res.status(200).json({ msg: "User login successfully", token: token, refreshToken: refreshToken })

    } catch (error) {
        res.status(400).json({ msg: "Internal Server Error" })
    }
})


router.get("/logout", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]
    try {

        if (!token) {
            res.status(400).json({ msg: "Token not provided" })
        }

        const isBlacklist = await BlacklistToken.exists({ token })

        if (!isBlacklist) {
            res.status(400).json({ msg: "user already logged out" })
        }

        await BlacklistToken.create(token)

        res.status(200).json({ msg: "User logout successfully" })

    } catch (error) {
        res.status(400).json({ msg: "Internal Server Error" })
    }
})

module.exports = router