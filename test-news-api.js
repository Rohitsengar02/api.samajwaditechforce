// Test script to verify the News API is working
const testData = {
    title: "Test News Article",
    excerpt: "This is a test excerpt to verify the API is working correctly",
    coverImage: "https://via.placeholder.com/400",
    content: [
        {
            type: "heading",
            content: "Test Heading",
            meta: { size: "h2" }
        },
        {
            type: "paragraph",
            content: "This is a test paragraph to ensure the API can save content blocks."
        }
    ],
    status: "Published"
};

fetch('http://localhost:5000/api/news', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
})
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

// To run this test:
// node backend/test-news-api.js
