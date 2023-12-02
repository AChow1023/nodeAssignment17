const showCharacters = async () => {
    let characterJSON = await getJSON();
    let characterDiv = document.getElementById("character-list");
    characterDiv.innerHTML = "";

    
    characterJSON.forEach((character) =>{
        let section = document.createElement("section");
        characterDiv.append(section);

        let h3 = document.createElement("h3");
        h3.innerHTML = character.name;
        section.append(h3);

        if(character.img){
            let img = document.createElement("img");
            section.append(img);
            img.src = character.img;
            }

        let ul = document.createElement("ul");
        
        let liHe = document.createElement("li");
        liHe.innerHTML = 'Height: ' + character.height;
        ul.append(liHe);

        let liN = document.createElement("li");
        liN.innerHTML = 'Nationality: ' + character.nationality;
        ul.append(liN);

        let liS = document.createElement("li");
        liS.innerHTML = 'Stand Power: ' + character.stand_power;
        ul.append(liS);

        let liE = document.createElement("li");
        liE.innerHTML = 'Enemy: ' + character.enemy;
        ul.append(liE);

        section.append(ul);

        let ulT = document.createElement("ul");
        let liT = document.createElement("li");
        liT.innerHTML = "Team: ";
        ulT.append(liT);
        character.team.forEach((character) => {
            ulT.append(liTeamCharacters(character));
        });
        section.append(ulT);
        
        
        const dLink = document.createElement("a");
        dLink.innerHTML = "Delete";
        dLink.id = "delete-link";
        
        const eLink = document.createElement("a");
        eLink.innerHTML = "Edit";
        eLink.id = "edit-link";

        section.append(eLink);
        section.append(dLink);

        eLink.onclick = (e) => {
            e.preventDefault();
            document.querySelector(".dialog").classList.remove("hidden");
            document.getElementById("add-edit-title").innerHTML = "Edit Character";
            document.getElementById("submit-msg").classList.add("hidden");
            resetForm();
            populateEditForm(character);
        };
        
        dLink.onclick = (e) => {
            e.preventDefault();
            deleteCharacter(character);
        };
    });

    
};

const deleteCharacter = async (character) => {
    let response = await fetch (`/api/characters/${character._id}`, {
        method: "DELETE",
        headers: {
            "Content-Type":"application/json;charset=utf-8"
        }
    });
    if(response.status != 200){
        console.log("Error deleting");
        return;
    }

    let result = await response.json();
    showCharacters();
    resetForm();
};

const liTeamCharacters = (character) => {
    let li = document.createElement("li");
    li.innerHTML = character;
    return li;
};

const getJSON = async () => {
    try{
        return (await fetch("/api/characters")).json();
    }
    catch(error){
        console.log(error);
    }
};

const populateEditForm = (character) => {
    const form = document.getElementById("add-edit-form");
    form._id.value = character._id;
    form.name.value = character.name;
    form.height.value = character.height;
    form.nationality.value = character.nationality;
    form.stand_power.value = character.stand_power;
    form.enemy.value = character.enemy;

    populateTeamCharacters(character.team);
};

const populateTeamCharacters = (teamCharacters) => {
    const section = document.getElementById("team-characters");
    teamCharacters.forEach((teamCharacter)=> {
        const input = document.createElement("input");
        input.type = "text";
        input.value = teamCharacter;
        section.append(input);
    });
};

const addEditCharacter = async (e) => {
    e.preventDefault();
    const form = document.getElementById("add-edit-form");
    const formData = new FormData(form);
    let response;
    formData.append("team", getTeam());

    if(form._id.value == -1){
    formData.delete("_id");
    
    response = await fetch("/api/characters", {
        method: "POST",
        body: formData
    });
    }
    else{
        response = await fetch(`/api/characters/${form._id.value}`, {
            method: "PUT",
            body: formData
        });
    }

    if (form._id.value != -1){
        showCharacters();
    }
    
    resetForm();
    document.querySelector(".dialog").classList.add("hidden");
    showCharacters();
    let submitMsg = document.getElementById("submit-msg");
    submitMsg.classList.remove("hidden");
};

const getTeam = () => {
    const inputs = document.querySelectorAll("#team-characters input");
    let teamCharacters = [];
    inputs.forEach((input) => {
        teamCharacters.push(input.value);
    });

    return teamCharacters;
};

const resetForm = () =>{
    const form = document.getElementById("add-edit-form");
    form.reset();
    form._id = "-1";
    document.getElementById("team-characters").innerHTML = "";
};

const showHideAdd = (e) => {
    e.preventDefault();
    document.querySelector(".dialog").classList.remove("hidden");
    document.getElementById("add-edit-title").innerHTML = "Add Character";
    document.getElementById("submit-msg").classList.add("hidden");
    resetForm();
};

const addTeamCharacter = (e) => {
    e.preventDefault();
    const teamCharacterBoxes = document.getElementById("team-characters");
    const input = document.createElement("input");
    input.type = "text";
    teamCharacterBoxes.append(input);
};

window.onload = () => {
    showCharacters();
    document.getElementById("add-edit-form").onsubmit = addEditCharacter;
    document.getElementById("add-link").onclick = showHideAdd;

    document.querySelector(".close").onclick = () =>{
        document.querySelector(".dialog").classList.add("hidden");
    };

    document.getElementById("add-team-character").onclick = addTeamCharacter;
};