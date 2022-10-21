"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(term) {
    const response = await axios.get('https://api.tvmaze.com/search/shows', { params: { q: term } });
    return response.data;
}


/** Given list of shows, create markup for each and to DOM */
function populateShows(shows) {
    $showsList.empty();
    for (let show of shows) {
        let imageUrl;
        let showSummary;
        if (show.show.image) {
            imageUrl = show.show.image.original;
        } else {
            imageUrl = 'https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300';
        }
        if (show.show.summary) {
            showSummary = show.show.summary;
        } else {
            showSummary = 'No Summary Available';
        }
        const $show = $(
            `<div data-show-id="${show.show.id}" class="Show col-md-12 col-lg-6 mb-5">
             <div class="media w-100">
              <img   
                src="${imageUrl}" 
                alt="${show.show.name}" 
                class="card-img-top rounded mb-3">
              <div class="media-body">
                <h5 class="text-primary">${show.show.name}</h5>
                <div><small>${showSummary}</small></div>
                  <button class="btn btn-outline-light btn-primary btn-sm Show-getEpisodes">
                    Show Episodes
                  </button>
                </div>
            </div>  
          </div>`
        );
        $showsList.append($show);
    }
}


/** Handle search form submission: get shows from API and display.
 *  Hide episodes area (that only gets shown if they ask for episodes) */
async function searchForShowAndDisplay() {
    const term = $("#search-query").val();
    const shows = await getShowsByTerm(term);
    $episodesArea.hide();
    populateShows(shows);
}


// Listen for form submission and execute function to search and display results
$searchForm.on("submit", async function(e) {
    e.preventDefault();
    await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *  { id, name, season, number } */
async function getEpisodesOfShow(id) {
    const response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
    return response.data;
}


// Given show name, will update Episode List Header
function renameListHeader(showName) {
    $('#episodes-list-header').text(`Episode List for ${showName}`);
}


/** Given an array of episodes, iterate through and append episode name,
 *  season number, and episode number as list item to episode area */
function populateEpisodes(episodes) {
    $('#episodes-list').empty();
    for (let episode of episodes) {
        const $episode = $(`
            <li class="list-group-item border-0">• ${episode.name} (Season ${episode.season}, Episode ${episode.number})</li>
        `);
        $('#episodes-list').append($episode);
    }
}


/** Listens for a click on an Episode List button, hides episode list if already open
    for that show, otherwise updates the episode list and moves it to the correct location */
$showsList.on('click', 'button', async function(e) {
    const $show = e.target.parentElement.parentElement.parentElement;
    const $showName = e.target.parentElement.firstElementChild.textContent;
    const episodeArray = await getEpisodesOfShow($show.dataset.showId);
    if (episodeArray.length > 0) {
        renameListHeader($showName);
        populateEpisodes(episodeArray);
    } else {
        renameListHeader(`${$showName} Not Available`);
    }
    if ($show.lastElementChild == e.target.parentElement.parentElement) {
        const currentButton = $episodesArea.prev().find('button');
        currentButton.text('Show Episodes');
        e.target.textContent = 'Hide Episodes';
        $episodesArea.appendTo($show);
        $episodesArea.show();
    } else {
        e.target.textContent = 'Show Episodes';
        $episodesArea.hide();
        $episodesArea.appendTo($showsList);
    }
})