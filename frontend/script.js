const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const postForm = document.getElementById('post-form');
const authSection = document.getElementById('auth-section');
const postSection = document.getElementById('post-section');
const postsList = document.getElementById('posts-list');

let token = "";

// Register user
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error registering user:', error);
    }
});

// Login user
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            authSection.classList.add('hidden');
            postSection.classList.remove('hidden');
            fetchPosts();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
});

// Create a post
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;

    try {
        const response = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });

        const data = await response.json();
        if (response.ok) {
            fetchPosts();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error creating post:', error);
    }
});

// Fetch all posts
async function fetchPosts() {
    try {
        const response = await fetch('http://localhost:5000/api/posts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const posts = await response.json();
        postsList.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <p><strong>Author:</strong> ${post.author.username}</p>
                <button class="update" onclick="showUpdateForm('${post._id}', '${post.title}', '${post.content}')">Update</button>
                <button class="delete" onclick="deletePost('${post._id}')">Delete</button>
                <div id="update-form-${post._id}" class="update-form hidden">
                    <input type="text" id="update-title-${post._id}" value="${post.title}" required>
                    <textarea id="update-content-${post._id}" required>${post.content}</textarea>
                    <button onclick="updatePost('${post._id}')">Save Changes</button>
                </div>
            `;
            postsList.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

// Show the update form for a specific post
function showUpdateForm(postId, title, content) {
    const updateForm = document.getElementById(`update-form-${postId}`);
    updateForm.classList.toggle('hidden');
}

// Update a post
async function updatePost(postId) {
    const updatedTitle = document.getElementById(`update-title-${postId}`).value;
    const updatedContent = document.getElementById(`update-content-${postId}`).value;

    try {
        const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: updatedTitle, content: updatedContent })
        });

        if (response.ok) {
            fetchPosts();
        } else {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                alert(data.message);
            } else {
                console.error("Unexpected response format:", await response.text());
                alert("An error occurred while updating the post.");
            }
        }
    } catch (error) {
        console.error('Error updating post:', error);
    }
}


// Delete a post
async function deletePost(postId) {
    try {
        const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            fetchPosts();
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}
