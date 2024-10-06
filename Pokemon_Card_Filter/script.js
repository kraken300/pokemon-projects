const form = document.querySelector(".searchForm");
const inputData = document.querySelector("input");
const cardContainer = document.querySelector(".cardContainer");
const loader = document.querySelector(".loader");
let resultsUrl;
let loading = false;
let storedData = [];

// Debounce function to limit the rate of function execution
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Load more data on scroll
// window.addEventListener("scroll", debounce(() => {
//     const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
//     if (scrollTop + clientHeight >= scrollHeight - 100 && !loading) {
//         getMoreData()
//     }
// }, 500));// Adjust delay as necessary

form.addEventListener("submit", (e) => {
    const pName = inputData.value.toLowerCase();
    e.preventDefault();
    setLoadingState(false);
    filterData(pName);
});

window.addEventListener("DOMContentLoaded", getMoreData);

async function getMoreData() {
    try {
        setLoadingState(true);// Start loading 
        console.log("Fetching data..."); // Log for debugging
        const url = `https://pokeapi.co/api/v2/pokemon?limit=5&offset=0`;
        const data = await getData(url);

        const { results } = data;

        if (results.length === 0) {
            errorDisplay("No more pokemon to display");
            return;
        }

        resultsUrl = results.map((result) => (result.url));

        const urlData = await Promise.all(resultsUrl.map(singleUrl => getData(singleUrl)));
        urlData.map(singleData => storedData.push(singleData));
        displayData(storedData);
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
}

function filterData(name) {
    const filteredData =  storedData.filter(fData => fData.name === name);
    cardContainer.textContent = "";
    displayData(filteredData);
    // console.log(filteredData);
}

function displayError(error) {

    // const existingError = document.querySelector(".errorDisplay");
    // if (existingError) {
    //     existingError.remove();
    // }

    const errorMessage = document.createElement("p");
    errorMessage.textContent = error;
    errorMessage.classList.add("errorDisplay");

    cardContainer.insertAdjacentElement("beforebegin", errorMessage);
    setTimeout(() => {
        errorMessage.remove();
    }, 2000);
}

function setLoadingState(isLoading) {
    loading = isLoading;
    loader.style.visibility = isLoading ? "visible" : "hidden";
}