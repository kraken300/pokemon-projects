const form = document.querySelector(".searchForm");
const inputData = document.querySelector("input");
const cardContainer = document.querySelector(".cardContainer");
const container = document.querySelector(".container");
const loader = document.querySelector(".loader");
const name = inputData.value.toLowerCase();
let resultsUrl;
let offsetLimit = 0;
let loading = false;

// Throttle function to limit the rate of function execution
function throttle(cb, delay = 1000) {
    let shouldWait = false;
    let waitingArgs;
    const timeoutFunc = () => {
        if (waitingArgs == null) {
            shouldWait = false;
        }
        else {
            cb(...waitingArgs);
            waitingArgs = null;
            setTimeout(timeoutFunc, delay);
        }
    }

    return (...args) => {
        if (shouldWait) {
            waitingArgs = args;
            return;
        };
        cb(...args);
        shouldWait = true;

        setTimeout(timeoutFunc, delay);
    }
};


// Load more data on scroll
window.addEventListener("scroll", throttle(() => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100 && !loading) {
        getMoreData()
    }
}),2000);// Adjust delay as necessary

form.addEventListener("submit", (e) => {
    e.preventDefault();
    offsetLimit = 0; // Reset offset when submitting a new search
    cardContainer.innerHTML = ""; // Clear previous results
    setLoadingState(false);
    getMoreData(); // Fetch new data
});

async function getMoreData() {
    if (loading) return; // Prevent multiple calls
    setLoadingState(true);// Start loading 
    console.log("Fetching more data..."); // Log for debugging

    try {
        const url = `https://pokeapi.co/api/v2/pokemon?limit=5&offset=${offsetLimit}`;
        const data = await getData(url);

        const { results } = data;

        if (results.length === 0) {
            errorDisplay("No more pokemon to display");
            return;
        }

        resultsUrl = results.map((result) => (result.url));

        const urlData = await Promise.all(resultsUrl.map(singleUrl => getData(singleUrl)));
        displayData(urlData);
    }

    catch (error) {
        console.error("Error fetching data", error);
        displayError("Failed to fetch Pokémon data.");
    }

    finally {
        setLoadingState(false);// End loading 
    }

}

async function getData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Cannot fetch data");
        }
        return await response.json();
    }
    catch (error) {
        console.log(error);
        throw error; // Rethrow to handle at a higher level
    }
}

function displayData(data) {
    const names = data.map(singleData => {
        return `
        <div class="card">
            <img src="${singleData.sprites.front_default}" alt="images">
            <h1>${singleData.name.charAt(0).toUpperCase() + singleData.name.slice(1)}</h1>
            <p><b>Type: </b>${singleData.types.map(type => type.type.name).join(", ")}</p>
            <p><b>Move: </b>${singleData.moves.map(move => move.move.name).slice(0, 4).join(", ")}</p>
            <p><b>Stat: </b>${singleData.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).slice(0, 3).join(", ")}</p>
        </div>
        `
    }).join(" ");
    cardContainer.innerHTML += names;
    offsetLimit += 5;
}

function displayError(error) {

    const existingError = document.querySelector(".errorDisplay");
    if (existingError) {
        existingError.remove();
    }

    const errorMessage = document.createElement("p");
    errorMessage.textContent = error;
    errorMessage.classList.add("errorDisplay");

    cardContainer.textContent = "";
    cardContainer.appendChild(errorMessage);
}

function setLoadingState(isLoading) {
    loading = isLoading;
    loader.style.visibility = isLoading ? "visible" : "hidden";
}