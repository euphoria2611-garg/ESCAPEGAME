let inventory = {};
let selectedLabItem = null;
let timeLeft = 900; // 15 Minutes Countdown Timer
let safeUnlocked = false;

// Audio Effects via Web Audio API
function playBeep(freq = 440, type = 'sine') {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.2);
    } catch(e) {}
}

// Timer Loop
setInterval(() => {
    if (timeLeft > 0) {
        timeLeft--;
        let min = Math.floor(timeLeft / 60);
        let sec = timeLeft % 60;
        document.getElementById('timerDisplay').innerText = `⏱️ TIME REMAINING: ${min}:${sec < 10 ? '0' : ''}${sec}`;
    }
}, 1000);

function logTerminal(message) {
    const log = document.getElementById('terminalLog');
    log.innerHTML += `<br>${message}`;
    log.scrollTop = log.scrollHeight;
}

function switchLocation(location) {
    const overlay = document.getElementById('lightsOverlay');
    overlay.classList.add('active');
    playBeep(300, 'triangle');
    logTerminal("[LIGHTS]: Dimming room lights for scene transition...");

    setTimeout(() => {
        document.getElementById('crimeSceneView').classList.remove('active-view');
        document.getElementById('labView').classList.remove('active-view');
        document.getElementById('btnCrimeScene').classList.remove('active');
        document.getElementById('btnLab').classList.remove('active');

        if (location === 'scene') {
            document.getElementById('crimeSceneView').classList.add('active-view');
            document.getElementById('btnCrimeScene').classList.add('active');
            logTerminal("[LOCATION]: Returned to Crime Scene.");
        } else {
            document.getElementById('labView').classList.add('active-view');
            document.getElementById('btnLab').classList.add('active');
            logTerminal("[LOCATION]: Entered Forensic Analysis Lab.");
            renderLabInventory();
        }

        setTimeout(() => overlay.classList.remove('active'), 200);
    }, 400);
}

function bagEvidence(id, name, desc) {
    if (inventory[id]) {
        logTerminal(`[INFO]: ${name} is already collected.`);
        return;
    }

    playBeep(600, 'sine');
    inventory[id] = { name, desc, analyzed: false };
    
    const card = document.getElementById(`item-${id}`);
    const status = document.getElementById(`status-${id}`);
    
    card.classList.add('bagged');
    status.innerText = "✔ Bagged";
    status.style.color = "#10b981";

    logTerminal(`[EVIDENCE COLLECTED]: Sealed '${name}' into evidence bag.`);
}

function readDiaryLog() {
    playBeep(500, 'sine');
    alert("📜 VICTIM'S DIARY EXCERPT:\n\n'Julian has been acting suspicious regarding our joint offshore account. He threatened to end things if I didn't sign the transfer paper tonight at 11:00 PM...'");
    logTerminal("[READ DIARY]: Victim diary entries reviewed.");
}

function openCipherPuzzle() {
    if (safeUnlocked) {
        alert("The safe is already unlocked!");
        return;
    }
    document.getElementById('cipherModal').style.display = 'flex';
}

function closeCipherModal() {
    document.getElementById('cipherModal').style.display = 'none';
}

function submitCipher() {
    const val = document.getElementById('cipherInput').value;
    // Pocket watch stopped at 11:12 PM -> Code is 1112
    if (val === "1112") {
        playBeep(800, 'sine');
        safeUnlocked = true;
        closeCipherModal();
        alert("🔓 SAFE UNLOCKED!\n\nInside you found: Secret Poison Bottleneck Vial!");
        bagEvidence('vial', 'Cyanide Bottleneck Vial', 'Found in locked safe. Contains toxic residue.');
        document.getElementById('status-safe').innerText = "✔ UNLOCKED";
        logTerminal("[CIPHER UNLOCKED]: Keypad cracked (1112). Found Poison Bottleneck Vial!");
    } else {
        playBeep(200, 'sawtooth');
        alert("❌ ACCESS DENIED! Incorrect PIN code.");
        logTerminal("[PUZZLE FAILED]: Wrong keypad PIN entry.");
    }
}

function renderLabInventory() {
    const container = document.getElementById('baggedItemsContainer');
    const keys = Object.keys(inventory);

    if (keys.length === 0) {
        container.innerHTML = `<p class="empty-msg">No evidence bagged yet. Return to Crime Scene to search items.</p>`;
        return;
    }

    container.innerHTML = "";
    keys.forEach(key => {
        const item = inventory[key];
        const btn = document.createElement('button');
        btn.className = 'bagged-item-btn';
        btn.innerText = `📦 ${item.name}`;
        btn.onclick = () => selectItemForTesting(key);
        container.appendChild(btn);
    });
}

function selectItemForTesting(key) {
    selectedLabItem = key;
    const item = inventory[key];
    const station = document.getElementById('activeTestingArea');

    station.innerHTML = `
        <h4>Testing Item: ${item.name}</h4>
        <p><em>${item.desc}</em></p>
        <hr style="border-color: #243452;">
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn" onclick="runFingerprintTest('${key}')">🔍 Fingerprint Dusting</button>
            <button class="btn" onclick="runChemicalTest('${key}')">🧪 Toxicology Screen</button>
        </div>
        <div id="testResultBox" style="margin-top: 15px; padding: 10px; background: #101625; border-radius: 6px;">
            ${item.analyzed ? item.testResult : 'Select a lab test above.'}
        </div>
    `;
}

function runFingerprintTest(key) {
    playBeep(520, 'sine');
    const item = inventory[key];
    let result = "";

    if (key === 'glass' || key === 'vial') {
        result = "✔ <strong>FINGERPRINT MATCH:</strong> Confirmed match for suspect Julian Croft.";
    } else if (key === 'watch') {
        result = "✔ <strong>DNA ANALYSIS:</strong> Hair tissue caught in watch clasp matches Julian Croft.";
    } else {
        result = "❌ <strong>FINGERPRINT TEST:</strong> Partial smudge. Inconclusive.";
    }

    item.analyzed = true;
    item.testResult = result;
    document.getElementById('testResultBox').innerHTML = result;
    logTerminal(`[LAB TEST]: Dusting complete for ${item.name}. Match logged.`);
}

function runChemicalTest(key) {
    playBeep(650, 'sine');
    const item = inventory[key];
    let result = "";

    if (key === 'glass' || key === 'vial') {
        result = "🚨 <strong>TOXICOLOGY MATCH:</strong> Lethal dose of Potassium Cyanide confirmed!";
    } else {
        result = "ℹ️ <strong>CHEMICAL SCREEN:</strong> Standard cosmetics & organic wax.";
    }

    item.analyzed = true;
    item.testResult = result;
    document.getElementById('testResultBox').innerHTML = result;
    logTerminal(`[LAB TEST]: Chemical toxicology screen complete for ${item.name}.`);
}

function toggleAccuseModal() {
    const modal = document.getElementById('accuseModal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
}

function makeAccusation(name, isCorrect) {
    toggleAccuseModal();
    if (isCorrect) {
        playBeep(900, 'sine');
        alert(`🎉 CASE SOLVED!\n\nYou successfully arrested ${name}.\nProof: Cyanide poison vial in safe + Fingerprints on glass + DNA skin under pocket watch!`);
        logTerminal(`[SOLVED]: Suspect ${name} convicted! Case file closed.`);
    } else {
        playBeep(150, 'sawtooth');
        alert(`❌ ACCUSATION FAILED!\n\n${name} has a clear alibi. The true killer escaped!`);
        logTerminal(`[FAILED]: Accused ${name}. Insufficient lab evidence.`);
    }
}