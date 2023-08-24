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

functions.http('createBlogPost', async (req, res) => {

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { title, content, author } = req.body;

    if (!title || !content || !author) {
        return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    try {
        const newPost = new BlogPost({
            title,
            content,
            author,
        });

        await newPost.save();
        res.status(201).json({ success: true, message: 'Blog post created successfully', postId: newPost._id });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ success: false, message: 'An error occurred while creating the blog post' });
    }
});

// gcloud functions deploy createBlogPost --runtime nodejs14 --trigger-http --region-us-central1 --allow-unauthenticated --project steadfast-tesla-396810