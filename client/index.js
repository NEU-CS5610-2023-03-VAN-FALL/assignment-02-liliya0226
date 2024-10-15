const reviewForm = document.querySelector(".reviewForm");
const reviewList = document.querySelector(".reviewsList");
const maxReviewLength = 200; 
const maxTitleLength = 50;

const refreshAllReviews = () => {
  fetch("http://localhost:8000/movie-reviews")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
        
        const html = data.map((review) => {
          // Frontend validation example
          if (!review.title || typeof review.title !== 'string') {
            console.error(`Invalid data for review with ID ${review.id}: Missing or invalid title.`);
            return ''; // Skip rendering this review
          }
  
          return `<li class="review">
              <h2>${review.title}</h2>
              <div class="review-buttons">
                  <button data-id="${review.id}" class="view-btn">View</button>
                  <button data-id="${review.id}" class="edit-btn">Edit</button>
                  <button data-id="${review.id}" class="delete-btn">Delete</button>
              </div>
            </li>`;
        });
  
        reviewList.innerHTML = html.join("");
    });
};

const insertSingleReview = (newReview) => {
  const htmlElement =         
    `<li class="review">
        <h2>${newReview.title}</h2>
        <div class="review-buttons">
            <button data-id="${newReview.id}" class="view-btn">View</button>
            <button data-id="${newReview.id}" class="edit-btn">Edit</button>
            <button data-id="${newReview.id}" class="delete-btn">Delete</button>
        </div>
    </li>`
  reviewList.insertAdjacentHTML("afterbegin", htmlElement);
  location.reload(); 
};


reviewForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newReview = {
    title: e.currentTarget.title.value,
    review: e.currentTarget.review.value,
    createdAt: new Date(),
  };

  if (newReview.title.length > maxTitleLength) {
    alert("Title is too long. Please limit your title to 50 characters.");
    return;
  }
  if (newReview.review.length > maxReviewLength) {
    alert("Review is too long. Please limit your review to 200 characters.");
    return;
  }
  
  fetch("http://localhost:8000/movie-review", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newReview),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        throw Error(data.error);
      }
      console.log("Success:", data);
      e.target.reset();
      insertSingleReview(newReview);
    })
    .catch(error => alert(error));
});



// Add an event listener
reviewList.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-btn")) {
        const reviewId = e.target.getAttribute("data-id");

        const existingModal = document.querySelector(".review-modal");
        if (existingModal) {
            existingModal.remove(); 
        }

        // Send a request to get reviews for a specific movie based on the reviewId
        fetch(`http://localhost:8000/movie-review/${reviewId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                const movieReview = data; // Use the entire data as the review object

                // Create a popup or modal to display the review
                const reviewModal = document.createElement("div");
                reviewModal.classList.add("review-modal");
    
                const reviewItem = document.createElement("div");
                reviewItem.classList.add("review-item");
                const formattedCreatedAt = new Date(movieReview.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                  });
  
                reviewItem.innerHTML = `
                    <p>${movieReview.review}</p>
                    <p>Created at: ${formattedCreatedAt}</p> 
                `;
    
                reviewModal.appendChild(reviewItem);
    
                // Insert the modal just below the clicked "View" button
                e.target.insertAdjacentElement("afterend", reviewModal);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
});
// Add an event listener to the reviewList
reviewList.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
        const reviewId = e.target.getAttribute("data-id");

        // Fetch the review data based on the reviewId
        fetch(`http://localhost:8000/movie-review/${reviewId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                const reviewToEdit = data; // Use the entire data as the review object

                const editForm = document.createElement("form");
                editForm.classList.add("edit-form");

             
                const titleLabel = document.createElement("label");
                titleLabel.textContent = "Title:";
                const titleInput = document.createElement("input");
                titleInput.type = "text";
                titleInput.value = reviewToEdit.title;
                titleLabel.appendChild(titleInput);

                const reviewLabel = document.createElement("label");
                reviewLabel.textContent = "Review:";
                const reviewInput = document.createElement("textarea");
                reviewInput.value = reviewToEdit.review;
                reviewLabel.appendChild(reviewInput);
                
                const submitButton = document.createElement("button");
                submitButton.type = "submit";
                submitButton.textContent = "Save Changes";

                editForm.appendChild(titleLabel);
                editForm.appendChild(reviewLabel);
                editForm.appendChild(submitButton);

                // Add an event listener for form submission
                editForm.addEventListener("submit", (event) => {
                    event.preventDefault();

                    const updatedReview = {
                        title: titleInput.value,
                        review: reviewInput.value,
                        UpdatedAt: new Date()
                    };
                    console.log("Submit button clicked!");
                    if (updatedReview.title.length > maxTitleLength) {
                        alert("Title is too long. Please limit your title to 50 characters.");
                        return;
                    }
                    console.log("Submit button clicked2!");
                    console.log(updatedReview.review.length);
                    if (updatedReview.review.length > maxReviewLength) {
                        alert("Review is too long. Please limit your review to 200 characters.");
                        return;
                    }
                    console.log(updatedReview.review.length > maxReviewLength);
                    console.log("Submit button clicked3!");

                    // Send a request to update the review
                    fetch(`http://localhost:8000/movie-review/${reviewId}`, {
                     
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(updatedReview),
                    })
                        .then((response) => response.json())
                        .then((updatedData) => {
                            console.log("Review updated:", updatedData);
                            location.reload();
                        })
                        .catch((error) => {
                            console.error("Error updating review:", error);
                        });
                });

                // Replace the existing review item with the edit form
                const reviewItem = e.target.closest(".review");
                reviewItem.innerHTML = "";
                reviewItem.appendChild(editForm);

            })
            .catch((error) => {
                console.error("Error fetching review data for editing:", error);
            });
    }
});


reviewList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const reviewId = e.target.getAttribute("data-id");

        fetch(`http://localhost:8000/movie-review/${reviewId}`, {
            method: "DELETE",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Review deleted:", data);
                location.reload();
            })
            .catch((error) => {
                console.error("Error deleting review:", error);
            });
    }
});

  
refreshAllReviews();
