// routes/posts.js

const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Create a post
router.post('/', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const post = new Post({ title, content, author: req.user.id });
    await post.save();
    res.status(201).json(post);
});

// Get all posts
router.get('/', async (req, res) => {
    const posts = await Post.find().populate('author', 'username');
    res.json(posts);
});

// Delete a post (only if the user is the author)
router.delete('/:id', authMiddleware, async (req, res) => {
    console.log('DELETE request received for post ID:', req.params.id);
    console.log('User ID from token:', req.user.id);

    try {
        const post = await Post.findById(req.params.id);

        // Check if the post exists
        if (!post) {
            console.log('Post not found');
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the logged-in user is the author of the post
        if (post.author.toString() !== req.user.id) {
            console.log('User is not the author');
            return res.status(403).json({ message: 'Access denied. You are not the author of this post.' });
        }

        // Delete the post
        await Post.findByIdAndDelete(req.params.id);
        console.log('Post deleted successfully');
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a post title (only if the user is the author)
router.put('/update-title/:id', authMiddleware, async (req, res) => {
    const { title } = req.body;

    try {
        // Find the post by its ID
        const post = await Post.findById(req.params.id);

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the logged-in user is the author of the post
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. You are not the author of this post.' });
        }

        // Update the post's title
        post.title = title;
        await post.save();

        res.status(200).json({ message: 'Post title updated successfully', post });
    } catch (error) {
        console.error('Error updating post title:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
