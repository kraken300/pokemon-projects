let input = document.querySelector("input");
const searchBtn = document.querySelector(".search");
const card = document.querySelector(".card");

async function handleSearch() {
    const name = input.value.toLowerCase().trim();
    if (name) {
        const data = await getData(name);
        displayData(data);
    }
    else {
        displayError("Please enter a name");
    }
}

async function getData(pokeName) {
    try {
        const url = `https://pokeapi.co/api/v2/pokemon/${pokeName}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Cannot get data");
        }
        return await response.json();
    }
    catch (error) {
        displayError(error);
        console.log(error);
    }
}

function displayData(data) {
    const { abilities, moves, name, sprites: { front_default: img }, stats, types } = data;
    let { height, weight } = data;
    const [ability1, ability2 = "", ...restAbilities] = (abilities?.map(ability => ability.ability.name)) || [];
    const [move1, move2 = "", move3 = "", move4, ...restMoves] = moves.map(move => move.move.name);
    const [stat1, stat2, stat3, ...restStats] = stats.map(stat => stat.base_stat);
    const [statName1, statName2 = "", statName3 = "", ...restStatNames] = stats.map(stat => stat.stat.name);
    const [type1, type2 = "", ...restTypes] = types.map(type => type.type.name);

    height = height.toString().slice(0, -1) + "." + height.toString().slice(-1);
    weight = weight.toString().slice(0, -1) + "." + weight.toString().slice(-1);
    card.textContent = "";
    card.style.display = "flex";
    
    const heading = document.createElement("h1");
    const image = document.createElement("img");
    const heightM = document.createElement("p");
    const weightKG = document.createElement("p");
    const ability = document.createElement("p");
    const move = document.createElement("p");
    const stat = document.createElement("p");
    const type = document.createElement("p");

    heading.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    image.src = `https://img.pokemondb.net/artwork/${name}.jpg`;
    heightM.innerHTML = `<b>Height:</b> ${height.padStart(3, "0")} m`;
    weightKG.innerHTML = `<b>Weight:</b> ${weight} kg`;
    ability.innerHTML = `<b>Abilitiy:</b> ${ability1}, ${ability2}`;
    move.innerHTML = `<b>Move:</b> ${move1}, ${move2}, ${move3}`;
    stat.innerHTML = `<b>Stat:</b> ${statName1}: ${stat1}, ${statName2}: ${stat2}, ${statName3}: ${stat3}`;
    type.innerHTML = `<b>Type:</b> ${type1}, ${type2}`

    heading.classList.add("heading");

    card.appendChild(heading);
    card.appendChild(image);
    card.appendChild(heightM);
    card.appendChild(weightKG);
    card.appendChild(ability);
    card.appendChild(move);
    card.appendChild(stat);
}

function displayError(error) {
    const errorMessage = document.createElement("p");
    errorMessage.textContent = error;
    errorMessage.classList.add("displayError");

    card.textContent = "";
    card.style.display = "flex";
    card.appendChild(errorMessage);
}

searchBtn.onclick = handleSearch;