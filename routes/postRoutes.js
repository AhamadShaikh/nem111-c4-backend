const express = require("express");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const BlacklistToken = require("../model/blacklist");
const Post = require("../model/postModel");
const middleware = require("../middleware/auth")

const router = express.Router()

router.get("/", middleware, async (req, res) => {
    const { page, limit, device1, device2 } = req.query
    const { userId } = req.body
    if (userId) {
        query.userId = userId
    }
    if (device1 && device2) {
        query.device1 = { $and: [{ device: device1, device: device2 }] }
    } else if (device1) {
        query.device = device1
    } else if (device2) {
        query.device = device2
    }
    try {
        const posts = await Post.find(query).skip((page - 1) * limit).limit(limit)
        await posts.save();
        res.status(200).json({ posts: posts })
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }
})

router.post("/add", middleware, async (req, res) => {
    try {
        const posts = await Post.create({ ...req.body, userId: req.userId, name: req.name })
        await posts.save()
        res.status(200).json({ msg: "Post added successfully" })
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }
})

router.patch("/update/:postId", middleware, async (req, res) => {
    const postId = req.params.postId
    try {

        const post = await Post.findById(postId)

        if (post.creator.toString() !== req.userId) {
            res.status(400).json({ msg: "User cannot update the post" })
        }

        const updatePost = await Post.findByIdAndUpdate(postId, { ...req, body }, { new: true })

        await updatePost.save()

        res.status(200).json({ msg: "Post updated successfully" })
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }
})

router.delete("/delete/:postId", middleware, async (req, res) => {
    const postId = req.params.postId
    try {

        const post = await Post.findById(postId)

        if (post.creator.toString() !== req.userId) {
            res.status(400).json({ msg: "User cannot delete the post" })
        }

        const deletePost = await Post.findByIdAndDelete(postId, { ...req, body }, { new: true })

        await deletePost.save()

        res.status(200).json({ msg: "Post deleted successfully" })
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }
})

module.exports = router