const searchForm = document.getElementById("search-form");
const usernameInput = document.getElementById("github-username");
const validationMsg = document.getElementById("validation-msg");
const controlsSection = document.getElementById("controls-section");
const languageFilter = document.getElementById("language-filter");
const sortSelect = document.getElementById("sort-select");
const loadingMsg = document.getElementById("loading-msg");
const errorMsg = document.getElementById("error-msg");
const repositoryGrid = document.getElementById("repository-grid");

let currentRepos = [];
let displayedRepos = [];

// MAIN
document.addEventListener("DOMContentLoaded", () => {
  /**
   * Part 10 - localStorage: Load previously searched username
   */
  const savedUsername = localStorage.getItem("github-username");
  if (savedUsername) {
    usernameInput.value = savedUsername;
    /**
     * Optional: Automatically perform the search for the saved username
     */
    fetchRepositories(savedUsername);
  }
});

/**
 * Part 3 - Search Form & Validation
 */
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();

  if (!username) {
    validationMsg.classList.remove("hidden");
    return;
  }

  validationMsg.classList.add("hidden");
  localStorage.setItem("github-username", username);
  fetchRepositories(username);
});

/**
 * Part 4 & 7 - REST API, fetch(), async/await & Error Handling
 */
async function fetchRepositories(username) {
  resetUI();
  loadingMsg.classList.remove("hidden");

  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("User not found.");
      }
      throw new Error("API request fails.");
    }

    const data = await response.json();

    if (data.length === 0) {
      throw new Error("No repositories found.");
    }

    currentRepos = data;

    // Dynamically populate language filter based on actual repos
    populateLanguageFilter(currentRepos);
    controlsSection.classList.remove("hidden");

    processAndRender();
  } catch (error) {
    errorMsg.textContent = error.message;
    errorMsg.classList.remove("hidden");
  } finally {
    /**
     * Part 6 - Loading State
     */
    loadingMsg.classList.add("hidden");
  }
}

// Populate the language filter dynamically
function populateLanguageFilter(repos) {
  const languages = new Set();
  repos.forEach((repo) => {
    if (repo.language) {
      languages.add(repo.language);
    }
  });

  // Reset filter options
  languageFilter.innerHTML = '<option value="All">All</option>';

  const sortedLanguages = Array.from(languages).sort();
  sortedLanguages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang;
    option.textContent = lang;
    languageFilter.appendChild(option);
  });

  // Add "Other" for repos that don't have a specific language
  const hasOther = repos.some((repo) => !repo.language);
  if (hasOther) {
    const option = document.createElement("option");
    option.value = "Other";
    option.textContent = "Other (No language)";
    languageFilter.appendChild(option);
  }
}

/**
 * Part 8 & 9 - Filtering and Sorting logic
 */
function processAndRender() {
  const selectedLang = languageFilter.value;
  const selectedSort = sortSelect.value;

  // 1. Filter
  displayedRepos = currentRepos.filter((repo) => {
    if (selectedLang === "All") return true;
    if (selectedLang === "Other" && !repo.language) return true;
    return repo.language === selectedLang;
  });

  // 2. Sort
  displayedRepos.sort((a, b) => {
    if (selectedSort === "name-asc") {
      return a.name.localeCompare(b.name);
    } else if (selectedSort === "name-desc") {
      return b.name.localeCompare(a.name);
    } else if (selectedSort === "stars-desc") {
      return b.stargazers_count - a.stargazers_count;
    } else if (selectedSort === "stars-asc") {
      return a.stargazers_count - b.stargazers_count;
    }
    return 0;
  });

  // 3. Render the processed data
  renderRepositories();
}

// Listeners for changing filter or sort options dynamically
languageFilter.addEventListener("change", processAndRender);
sortSelect.addEventListener("change", processAndRender);

/**
 * Part 5 - JSON and Dynamic Rendering
 */
function renderRepositories() {
  repositoryGrid.innerHTML = "";

  if (displayedRepos.length === 0) {
    repositoryGrid.innerHTML =
      "<p>No repositories match the selected filter.</p>";
    return;
  }

  displayedRepos.forEach((repo) => {
    const card = document.createElement("article");
    card.className = "repo-card";

    const name = document.createElement("h2");
    name.className = "repo-name";
    name.textContent = repo.name;

    const desc = document.createElement("p");
    desc.className = "repo-desc";
    desc.textContent = repo.description || "No description available.";

    const meta = document.createElement("div");
    meta.className = "repo-meta";

    const lang = document.createElement("span");
    lang.textContent = `Language: ${repo.language || "N/A"}`;

    const stars = document.createElement("span");
    stars.textContent = `⭐ Stars: ${repo.stargazers_count}`;

    meta.appendChild(lang);
    meta.appendChild(stars);

    const link = document.createElement("a");
    link.className = "repo-link";
    link.href = repo.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View on GitHub";

    card.appendChild(name);
    card.appendChild(desc);
    card.appendChild(meta);
    card.appendChild(link);

    repositoryGrid.appendChild(card);
  });
}

function resetUI() {
  errorMsg.classList.add("hidden");
  controlsSection.classList.add("hidden");
  repositoryGrid.innerHTML = "";
  currentRepos = [];
  displayedRepos = [];
}
