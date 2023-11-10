const express = require("express");
const { PrismaClient } = require("@prisma/client");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

const maxReviewLength = 200;
const maxTitleLength = 50;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const prisma = new PrismaClient();

// Create a new movie review
app.post("/movie-review", async (req, res) => {
  const { title, review } = req.body;
  console.log(review.length);
  if (title.length > maxTitleLength) {
    return res.status(400).json({ error: "Title is too long. Please limit your title to 50 characters." });
  }
  if (review.length > maxReviewLength) {
    return res.status(400).json({ error: "Review length exceeds the maximum limit" });
  }
  console.log("Submit put!");

  try {
    const movieReview = await prisma.Movie.create({
      data: {
        title,
        review,
      },
    });

    res.json(movieReview);
  } catch (error) {
    console.error("Error creating movie review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all movie reviews
app.get("/movie-reviews", async (req, res) => {
    try {
      const movieReviews = await prisma.Movie.findMany({});
  
      // Backend data validation example
      const validatedReviews = movieReviews.map((review) => {
        if (!review.title || typeof review.title !== 'string') {
          console.error(`Invalid data for review with ID ${review.id}: Missing or invalid title.`);
          return null; // Skip sending this review to the client
        }
  
        return {
          id: review.id,
          title: review.title,
          // Add other properties to validate if needed
        };
      }).filter(Boolean); // Remove null values from the array
  
      res.json(validatedReviews);
    } catch (error) {
      console.error("Error fetching movie reviews:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Get a specific movie review by ID
app.get("/movie-review/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
  
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid ID parameter" });
      }
  
      const movieReview = await prisma.Movie.findUnique({
        where: { id },
      });
  
      if (!movieReview) {
        return res.status(404).json({ error: "Movie review not found" });
      }
  
      res.json(movieReview);
    } catch (error) {
      console.error("Error fetching movie review:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

// Update a movie review
app.put("/movie-review/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, review } = req.body;
  
    // Validate input
    if (!title || !review) {
      return res.status(400).json({ error: "Title and review are required" });
    }
    console.log("Submit put!");
    if (title.length > maxTitleLength) {
        return res.status(400).json({ error: "Title is too long. Please limit your title to 50 characters." });
    }
    console.log("Submit put2!");
    if (review.length > maxReviewLength) {
      return res.status(400).json({ error: "Review length exceeds the maximum limit" });
    }  
    console.log("Submit put3!");
    // Check if the movie review exists
    const existingReview = await prisma.Movie.findUnique({
      where: { id },
    });
    console.log("Submit put4!");
    if (!existingReview) {
      return res.status(404).json({ error: "Movie review not found" });
    }
    console.log("Submit put5!");

    // Update the movie review
    const updatedReview = await prisma.Movie.update({
      where: { id },
      data: {
        title,
        review,
      },
    });
  
    res.json(updatedReview);
  });
  

// Delete a movie review
app.delete("/movie-review/:id", async (req, res) => {
    const id = parseInt(req.params.id);
  
    try {
      // Check if the movie review exists before attempting to delete
      const existingReview = await prisma.Movie.findUnique({
        where: { id },
      });
  
      if (!existingReview) {
        return res.status(404).json({ error: "Movie review not found" });
      }
  
      // If the review exists, proceed with the deletion
      await prisma.Movie.delete({
        where: { id },
      });
  
      res.json({ message: "Movie review deleted" });
    } catch (error) {
      console.error("Error deleting movie review:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});
