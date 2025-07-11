const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // For example, username must be at least 3 chars and alphanumeric only
  if (!username) return false;
  const validFormat = /^[a-zA-Z0-9]{3,}$/;
  return validFormat.test(username);
}

const authenticatedUser = (username, password) => {
  if (!isValid(username)) return false;
  if (!password) return false;

  // Check if user exists and password matches
  if (users[username] && users[username] === password) {
    return true;
  }
  return false;
}
//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Create JWT token
  let accessToken = jwt.sign(
    { username: username },
    "access", // secret key
    { expiresIn: "1h" }
  );

  // Save token and username in session
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "Login successful!", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully.", reviews: books[isbn].reviews });
});

//regd_users.delete("/auth/review/:isbn", (req, res) => {
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully." });
  } else {
    return res.status(404).json({ message: "No review found for this user." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
