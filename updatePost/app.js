const functions = require('@google-cloud/functions-framework');
const dotenv = require('dotenv');
dotenv.config(); // Load variables from .env into process.env

const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const uri = `mongodb+srv://sudalaiashokpandis:${process.env.DB_PASSWORD}@cluster0.ib4dn2k.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const BlogPost = mongoose.model('BlogPost', {
    title: String,
    content: String,
    author: String,
    publicationDate: { type: Date, default: Date.now },
});

functions.http('updateBlogPost', async (req, res) => {

    if (req.method !== 'PUT') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { title, content, author, postId } = req.body;

    if (!title || !content || !author || !postId) {
        return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    const updatedDataPost = {
        title, content, author
    }

    try {
        const updatedPost = await BlogPost.findOneAndUpdate(
            { _id: postId },
            updatedDataPost,
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        const { _id, title, content, author } = updatedPost;

        res.status(200).json({ success: true, message: 'Blog post updated successfully', updatedPost: { _id, title, content, author } });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the blog post' });
    }
});

// gcloud functions deploy updateBlogPost --runtime nodejs14 --trigger-http --region us-central1 --allow-unauthenticated --project steadfast-tesla-396810