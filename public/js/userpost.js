$(document).ready(function () {
    function renderPosts(posts) {
        const postList = $('#post-list');
        postList.empty();
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postList.append(postElement);
        });
    }

    function createPostElement(post) {
        return `
            <li class="post" data-id="${post._id}">
                <div class="user">
                    <img src="/path/to/avatar.jpg" alt="User Avatar">
                    <span>${post.user}</span>
                </div>
                <div class="content">
                    <h3><a href="#">${post.title}</a></h3>
                    <p>Posted by ${post.user} | ${new Date(post.timestamp).toLocaleString()}</p>
                    <p>${post.content}</p>
                    <div class="voting">
                        <button class="upvote-button">Upvote</button>
                        <span class="upvote-counter">${post.upvotes}</span>
                        <button class="downvote-button">Downvote</button>
                        <span class="downvote-counter">${post.downvotes}</span>
                    </div>
                    <div class="comment-section">
                        <ul class="comment-list">
                            ${post.comments.map(comment => `<li class="comment"><strong>${comment.user}</strong>: ${comment.text}</li>`).join('')}
                        </ul>
                        <form class="comment-form">
                            <textarea name="commentText" placeholder="Add a comment..."></textarea>
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            </li>
        `;
    }

    function handleNewPost(event) {
        event.preventDefault();
        const title = $('#new-post-title').val();
        const content = $('#new-post-content').val();

        $.ajax({
            type: 'POST',
            url: '/createPost',
            data: { title, content },
            success: function(newPost) {
                $('#new-post-title').val('');
                $('#new-post-content').val('');
                const newPostElement = createPostElement(newPost);
                $('#post-list').prepend(newPostElement);
            },
            error: function(err) {
                console.log('Error creating post:', err);
            }
        });
    }

    $('#new-post-form').on('submit', handleNewPost);

    function handleNewComment(event) {
        event.preventDefault();
        const commentText = $(this).find('textarea[name="commentText"]').val();
        const postId = $(this).closest('.post').data('id');

        $.ajax({
            type: 'POST',
            url: `/api/posts/${postId}/comments`,
            data: { commentText },
            success: function(response) {
                if (response.success) {
                    renderPosts([response.post]);
                }
            },
            error: function(err) {
                console.log('Error adding comment:', err);
            }
        });
    }

    $('#post-list').on('submit', '.comment-form', handleNewComment);

    function handleVote(event, voteType) {
        event.preventDefault();
        const postId = $(this).closest('.post').data('id');

        $.ajax({
            type: 'POST',
            url: '/vote',
            data: { postId, voteType },
            success: function(response) {
                if (response.success) {
                    const updatedPost = response.post;
                    $(`li[data-id='${updatedPost._id}'] .upvote-counter`).text(updatedPost.upvotes);
                    $(`li[data-id='${updatedPost._id}'] .downvote-counter`).text(updatedPost.downvotes);
                }
            },
            error: function(err) {
                console.log('Error voting on post:', err);
            }
        });
    }

    $('#post-list').on('click', '.upvote-button', function(event) {
        handleVote.call(this, event, 'upvote');
    });

    $('#post-list').on('click', '.downvote-button', function(event) {
        handleVote.call(this, event, 'downvote');
    });

    $.get('/api/posts', function(data) {
        renderPosts(data.posts);
    });

    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    });

    $('#back-to-top').click(function() {
        $('html, body').animate({scrollTop: 0}, 600);
        return false;
    });

    $('#latest-posts').click(function() {
        const latestPosts = initialPosts.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        renderPosts(latestPosts);
    });

    $('#popular-posts').click(function() {
        const popularPosts = initialPosts.slice().sort((a, b) => b.upvotes - a.upvotes);
        renderPosts(popularPosts);
    });
});
