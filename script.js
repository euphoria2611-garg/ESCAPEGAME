let currentRoomIndex = 1;
let inventory = [];
let roomUnlocked = { 1: true, 2: false, 3: false, 4: false };
let secondsLeft = 600; // 10 minutes timer
let timerInterval = setInterval(updateTimer, 1000);

function updateTimer() {
    let mins = Math.floor(secondsLeft / 60);
    let secs = secondsLeft % 60;
    document.getElementById('timerDisplay').innerText = `⏱️ ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    if (secondsLeft > 0) {
        secondsLeft--;
    } else {
        clearInterval(timerInterval);
        alert("⏰ Time Up! The evidence got contaminated. Case Failed!");
        location.reload();
    }
}

const rooms = {
    1: {
        title: "ROOM 1: THE CRIME SCENE STUDY",
        desc: "Victim found dead at the desk. The door is locked from inside. Look for hidden forensic traces.",
        objects: [
            { id: 'uv', name: '🔦 UV Forensic Flashlight', action: 'collect', desc: 'Found hidden blood spatter patterns on the rug.' },
            { id: 'diary', name: '📖 Victim’s Torn Diary', action: 'collect', desc: 'Note reads: "The killer messed with the lab centrifuge settings at 4092."' },
            { id: 'door1', name: '🚪 Heavy Oak Door (Keypad Locked)', action: 'puzzle1', desc: 'Requires a 4-digit code found in clues.' }
        ]
    },
    2: {
        title: "ROOM 2: FORENSIC AUTOPSY & TOXICOLOGY LAB",
        desc: "Chemical benches and microscope stations. A computer terminal requires authorization.",
        objects: [
            { id: 'reagent', name: '🧪 Chemical Reagent Vial', action: 'collect', desc: 'Reveals poisonous residue on the coffee cup.' },
            { id: 'terminal', name: '💻 Toxicology Database Terminal', action: 'puzzle2', desc: 'Enter chemical compound weight to unlock hallway access.' }
        ]
    },
    3: {
        title: "ROOM 3: INTERROGATION & EVIDENCE ARCHIVE",
        desc: "Suspect files and CCTV footage are stored here. Final security gate ahead.",
        objects: [
            { id: 'badge', name: '🪪 Master Security Card', action: 'collect', desc: 'Access card dropped by the corrupt insider.' },
            { id: 'finalGate', name: '🔒 Main Exit Forensic Vault', action: 'win', desc: 'Requires all evidence collected and master card.' }
        ]
    }
};

function renderRoom() {
    const room = rooms[currentRoomIndex];
    document.getElementById('roomTitle').innerText = room.title;
    
    let html = `<h2>${room.title}</h2><p>${room.desc}</p><div style="margin-top:20px; display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">`;
    
    room.objects.forEach(obj => {
        html += `<div class="interactive-object" onclick="handleObject('${obj.id}', '${obj.action}', '${obj.name}')">${obj.name}</div>`;
    });
    html += `</div>`;
    
    document.getElementById('viewport').innerHTML = html;
    document.getElementById('prevRoomBtn').style.display = currentRoomIndex > 1 ? 'inline-block' : 'none';
}

function handleObject(id, action, name) {
    if (action === 'collect') {
        if (!inventory.includes(name)) {
            inventory.push(name);
            document.getElementById('itemsList').innerText = inventory.join(', ');
            alert(`🔍 Forensic Evidence Secured: ${name}`);
        } else {
            alert("You already logged this item into evidence.");
        }
    } else if (action === 'puzzle1') {
        openPuzzleModal("ENTER CRIME SCENE PIN", "Clue: Check diary notes for centrifuge settings.", "4092", 2);
    } else if (action === 'puzzle2') {
        openPuzzleModal("TOXICOLOGY LOCK", "Clue: Enter atomic number of the poison compound (Hint: Potassium Cyanide base number is 56? No, check lab manual -> try 8812).", "8812", 3);
    } else if (action === 'win') {
        if (inventory.length >= 5) {
            clearInterval(timerInterval); // Timer stops successfully!
            alert("🏆 CASE CLOSED SUCCESSFULLY! Excellent forensic investigation, Vaishali! You caught the killer.");
            document.getElementById('viewport').innerHTML = `<h2>🎉 CASE SOLVED #104</h2><p>All evidence successfully processed. Killer convicted!</p>`;
        } else {
            alert("❌ Incomplete Investigation! You need to collect all 5 forensic items across the rooms before opening the vault.");
        }
    }
}

let targetAnswer = "";
let nextTargetRoom = 2;

function openPuzzleModal(title, desc, answer, targetRoom) {
    document.getElementById('puzzleTitle').innerText = title;
    document.getElementById('puzzleDesc').innerText = desc;
    document.getElementById('puzzleInput').value = "";
    targetAnswer = answer;
    nextTargetRoom = targetRoom;
    document.getElementById('puzzleModal').style.display = 'flex';
}

function closePuzzle() {
    document.getElementById('puzzleModal').style.display = 'none';
}

function submitPuzzle() {
    const val = document.getElementById('puzzleInput').value;
    if (val === targetAnswer) {
        roomUnlocked[nextTargetRoom] = true;
        closePuzzle();
        alert("🔓 Access Granted! Proceeding to next forensic sector.");
        currentRoomIndex = nextTargetRoom;
        renderRoom();
    } else {
        alert("❌ Incorrect Forensic Data! Re-examine the crime scene clues.");
    }
}

function changeRoom(direction) {
    let next = currentRoomIndex + direction;
    if (next >= 1 && next <= 3) {
        if (roomUnlocked[next]) {
            currentRoomIndex = next;
            renderRoom();
        } else {
            alert("🔒 Sector locked! Clear previous security clearance first.");
        }
    }
}

renderRoom();