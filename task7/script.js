const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const POSTS_PER_PAGE = 10;
const TOTAL_POSTS = 100;
const SCROLL_THRESHOLD = 200;
const DEBOUNCE_DELAY = 300;

let allPosts = [];
let loadedCount = 0;
let isLoading = false;
let searchQuery = '';
let debounceTimer = null;

const postsContainer = document.getElementById('postsContainer');
const loader = document.getElementById('loader');
const endMessage = document.getElementById('endMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const retryBtn = document.getElementById('retryBtn');
const searchInput = document.getElementById('searchInput');
const postCount = document.getElementById('postCount');

async function fetchPosts(start, limit) {
    const url = `${API_URL}?_start=${start}&_limit=${limit}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Сервер вернул ошибку ' + response.status);
    }

    return await response.json();
}

async function loadMorePosts() {
    if (isLoading || loadedCount >= TOTAL_POSTS) return;

    isLoading = true;
    showLoader();
    hideError();

    try {
        const posts = await fetchPosts(loadedCount, POSTS_PER_PAGE);

        if (posts.length === 0) {
            showEndMessage();
            return;
        }

        allPosts = allPosts.concat(posts);
        loadedCount += posts.length;

        renderPosts();

        if (loadedCount >= TOTAL_POSTS) {
            showEndMessage();
        }
    } catch (error) {
        showError(error.message || 'Не удалось загрузить посты');
    } finally {
        isLoading = false;
        hideLoader();
    }
}

function renderPosts() {
    const filtered = filterPosts(allPosts, searchQuery);
    postsContainer.innerHTML = '';

    updatePostCount(filtered.length, allPosts.length);

    filtered.forEach(post => {
        const card = createPostCard(post);
        postsContainer.appendChild(card);
    });
}

function updatePostCount(shown, total) {
    if (searchQuery) {
        postCount.textContent = shown + ' из ' + total + ' постов';
    } else {
        postCount.textContent = total + ' постов';
    }
}

function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';

    const header = document.createElement('div');
    header.className = 'post-header';

    const idBadge = document.createElement('span');
    idBadge.className = 'post-id';
    idBadge.textContent = '#' + post.id;

    const author = document.createElement('span');
    author.className = 'post-author';
    author.innerHTML = 'Автор: <strong>user ' + post.userId + '</strong>';

    header.appendChild(idBadge);
    header.appendChild(author);

    const title = document.createElement('h3');
    title.className = 'post-title';
    title.textContent = capitalizeFirst(post.title);

    const body = document.createElement('p');
    body.className = 'post-body';
    body.textContent = capitalizeFirst(post.body);

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(body);

    return card;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function filterPosts(posts, query) {
    if (!query) return posts;
    const lower = query.toLowerCase();
    return posts.filter(p => p.title.toLowerCase().includes(lower));
}

function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight - scrollTop - clientHeight <= SCROLL_THRESHOLD) {
        loadMorePosts();
    }
}

function handleSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchQuery = searchInput.value.trim();
        renderPosts();
    }, DEBOUNCE_DELAY);
}

function showLoader() {
    loader.classList.remove('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
}

function showEndMessage() {
    endMessage.classList.remove('hidden');
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

async function init() {
    await loadMorePosts();
}

window.addEventListener('scroll', handleScroll);
searchInput.addEventListener('input', handleSearch);
retryBtn.addEventListener('click', () => {
    hideError();
    loadMorePosts();
});

init();
