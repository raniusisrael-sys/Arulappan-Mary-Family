// 📜 RANIUS BUDDY'S PREMIUM FEATURE ENGINES (DUAL ENG/TAMIL BIBLE, CONFETTI, DATA EXPORT)

// ==========================================
// 1. 🔍 DUAL-LANGUAGE BIBLE SEARCH ENGINE (ENGLISH & TAMIL Parallel Layout)
// ==========================================
function executeLiveBibleSearchQuery() {
    const searchField = document.getElementById("bible-search-input-field");
    const resultArea = document.getElementById("bible-search-result-area");
    if (!searchField || !resultArea) return;

    let originalQuery = searchField.value.trim();
    if (!originalQuery) { alert("Please enter a book reference!"); return; }

    resultArea.style.display = "block";
    resultArea.innerHTML = "⏳ Searching holy scriptures in Tamil & English...";

    // 🔄 Tamil to English Book Mapping Dictionary
    const tamilBookMap = {
        "ஆதியாகமம்": "Genesis", "யாத்திராகமம்": "Exodus", "லேவியராகமம்": "Leviticus", 
        "எண்ணாகமம்": "Numbers", "உபாகமம்": "Deuteronomy", "யோசுவா": "Joshua", 
        "நியாயாதிபதிகள்": "Judges", "ரூத்": "Ruth", "சாமுவேல் 1": "1 Samuel", 
        "சாமுவேல் 2": "2 Samuel", "ராஜாக்கள் 1": "1 Kings", "ராஜாக்கள் 2": "2 Kings", 
        "நாளாகமம் 1": "1 Chronicles", "நாளாகமம் 2": "2 Chronicles", "எஸ்றா": "Ezra", 
        "நெகேமியா": "Nehemiah", "எஸ்தர்": "Esther", "யோபு": "Job", 
        "சங்கீதம்": "Psalms", "சங்கீதங்கள்": "Psalms", "நீதிமொழிகள்": "Proverbs", 
        "பிரசங்கி": "Ecclesiastes", "உன்னதப்பாட்டு": "Song of Solomon", "ஏசாயா": "Isaiah", 
        "எரேமியா": "Jeremiah", "புலம்பல்": "Lamentations", "எசேக்கியேல்": "Ezekiel", 
        "தானியேல்": "Daniel", "ஓசியா": "Hosea", "யோவேல்": "Joel", 
        "ஆமோஸ்": "Amos", "ஒபதியா": "Obadiah", "யோனா": "Jonah", 
        "மீகா": "Micah", "நாகூம்": "Nahum", "ஆபகூக்": "Habakkuk", 
        "செப்பனியா": "Zephaniah", "ஆகாய்": "Haggai", "சகரியா": "Zechariah", 
        "மல்கியா": "Malachi", "மத்தேயு": "Matthew", "மாற்கு": "Mark", 
        "லூக்கா": "Luke", "யோவான்": "John", "அப்போஸ்தலர்": "Acts", 
        "ரோமர்": "Romans", "கொரிந்தியர் 1": "1 Corinthians", "கொரிந்தியர் 2": "2 Corinthians", 
        "கலாத்தியர்": "Galatians", "எபேசியர்": "Ephesians", "பிலிப்பியர்": "Philippians", 
        "கொலோசெயர்": "Colossians", "தெசலோனிக்கேயர் 1": "1 Thessalonians", "தெசலோனிக்கேயர் 2": "2 Thessalonians", 
        "தீமோத்தேயு 1": "1 Timothy", "தீமோத்தேயு 2": "2 Timothy", "தீத்து": "Titus", 
        "பிலேமோன்": "Philemon", "எபிரெயர்": "Hebrews", "யாக்கோபு": "James", 
        "பேதுரு 1": "1 Peter", "பேதுரு 2": "2 Peter", "யோவான் 1": "1 John", 
        "யோவான் 2": "2 John", "யோவான் 3": "3 John", "யூதா": "Jude", "வெளிப்படுத்தின விசேஷம்": "Revelation"
    };

    let processedQuery = originalQuery;
    let englishBookName = "";
    
    // Check if input begins with Tamil script and substitute
    for (const tamilName in tamilBookMap) {
        if (originalQuery.startsWith(tamilName)) {
            processedQuery = originalQuery.replace(tamilName, tamilBookMap[tamilName]);
            englishBookName = tamilBookMap[tamilName];
            break;
        }
    }

    // Extract numbers safely (Handles formats like 1:1 or 1 1)
    const numbersOnly = processedQuery.match(/\d+/g);
    if (!numbersOnly || numbersOnly.length < 2) {
        resultArea.innerHTML = `❌ <strong>Format Error</strong><br><span style="font-size:12px;">Please use a clear chapter and verse format (e.g., john 3:16).</span>`;
        return;
    }
    
    const chapterNum = parseInt(numbersOnly[numbersOnly.length - 2], 10);
    const verseNum = parseInt(numbersOnly[numbersOnly.length - 1], 10);

    if (!englishBookName) {
        englishBookName = processedQuery.split(/\d+/)[0].trim();
    }

    // ✅ FIXED: Force title case styling (e.g., converts "john" to "John", "1 samuel" to "1 Samuel")
    englishBookName = englishBookName.toLowerCase().replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    });

    // Reconstruct the unified English query string for the primary API
    const finalEnglishQuery = `${englishBookName} ${chapterNum}:${verseNum}`;
    const cleanQuery = encodeURIComponent(finalEnglishQuery);
    
    // 1. Fetch English translation data
    const fetchEnglishVerse = fetch(`https://bible-api.com/${cleanQuery}`)
        .then(res => res.json())
        .catch(() => null);
    
    // 2. Fetch Tamil translation data directly using corrected capitalization paths
    const fetchTamilVerse = fetch(`https://raw.githubusercontent.com/aruljohn/Bible-tamil/main/${encodeURIComponent(englishBookName)}.json`)
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(bookData => {
            if (bookData && bookData.chapters && bookData.chapters[chapterNum - 1]) {
                const chapterObject = bookData.chapters[chapterNum - 1];
                if (chapterObject && chapterObject.verses && chapterObject.verses[verseNum - 1]) {
                    const verseData = chapterObject.verses[verseNum - 1];
                    return (typeof verseData === 'object') ? verseData.text : verseData;
                }
            }
            return null;
        })
        .catch(() => null);

    // Parallel promise stack evaluation
    Promise.all([fetchEnglishVerse, fetchTamilVerse])
    .then(([engData, tamilText]) => {
        let displayHTML = `<strong style="color: #00a884; font-size: 15px;">🕊️ ${originalQuery.toUpperCase()}</strong><br>`;
        
        // Show Tamil verse layout text stacked nicely on top
        if (tamilText) {
            displayHTML += `<div style="margin-top: 10px; font-weight: 600; color: var(--text-color, #1e293b); line-height: 1.6; font-size: 15.5px;">${tamilText}</div>`;
        } else {
            displayHTML += `<div style="margin-top: 8px; color: #94a3b8; font-size: 12.5px; font-style: italic;">(Tamil verse formatting not found)</div>`;
        }
        
        // Parallel English text rendering directly underneath
        if (engData && engData.text) {
            displayHTML += `<div style="margin-top: 12px; font-style: italic; opacity: 0.85; font-size: 13.5px; border-left: 3px solid #00a884; padding-left: 10px; line-height: 1.5; color: var(--text-color, #334155);">"${engData.text.trim()}"</div>`;
        }

        resultArea.innerHTML = displayHTML;
    })
    .catch(() => {
        resultArea.innerHTML = `❌ <strong>Reference Not Found</strong><br><span style="font-size:12px;">Ensure format is structured correctly (e.g., "சங்கீதம் 1:1" or "John 3:16").</span>`;
    });
}

// ==========================================
// 2. 🎉 PARTY CONFETTI CELEBRATION HOOK
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const birthdayList = document.getElementById("birthday-names-list");
    if (birthdayList) {
        birthdayList.addEventListener("click", () => {
            if (typeof confetti === "function") {
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                triggerAppHapticBump();
            }
        });
    }
});

// ==========================================
// 3. 📥 FAMILY REGISTRY SYSTEM CSV DATA EXPORT
// ==========================================
function exportFamilyRegistryToCSV() {
    if (!familyDataArray || familyDataArray.length === 0) {
        alert("No family data records loaded.");
        return;
    }
    triggerAppHapticBump();

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    csvContent += "ID,Full Name,Gender,Date of Birth,Occupation/Title,Mobile,Address,Status\n";

    familyDataArray.forEach(m => {
        const status = m.isDeceased ? "Legacy Member" : "Active Member";
        const row = [
            `"${m.id}"`,
            `"${m.name.replace(/"/g, '""')}"`,
            `"${m.gender}"`,
            `"${m.dob}"`,
            `"${m.title.replace(/"/g, '""')}"`,
            `"${m.mobile}"`,
            `"${m.address.replace(/"/g, '""')}"`,
            `"${status}"`
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", encodedUri);
    linkElement.setAttribute("download", `Family_Heritage_Registry_Export_${new Date().getFullYear()}.csv`);
    document.body.appendChild(linkElement);
    
    linkElement.click();
    document.body.removeChild(linkElement);
}
// ==========================================
// 4. ⏳ HISTORICAL TIMELINE & MILESTONE ENGINE (CLICKABLE PROFILES)
// ==========================================
function buildFamilyHistoricalTimeline() {
    const timelineContainer = document.getElementById("family-historical-timeline");
    if (!timelineContainer || !familyDataArray || familyDataArray.length === 0) return;

    let chronologicalRecords = familyDataArray.filter(m => m.dob && m.dob.includes('/'));

    chronologicalRecords.sort((a, b) => {
        const yearA = parseInt(a.dob.split('/')[2], 10);
        const yearB = parseInt(b.dob.split('/')[2], 10);
        return yearA - yearB;
    });

    // Extract the top 5 earliest pioneer lineage anchors
    let historicalMilestones = chronologicalRecords.slice(0, 5);

    timelineContainer.innerHTML = historicalMilestones.map((m) => {
        const borderStyle = m.isDeceased ? "border-left: 3px solid #64748b;" : "border-left: 3px solid #00a884;";
        const icon = m.isDeceased ? "🕊️" : "🌳";
        const birthYear = m.dob.split('/')[2];
        
        // Added standard openProfileModal action function context link string directly to the wrapper template
        return `
            <div onclick="window.openProfileModal('${m.id}')" style="padding-left: 12px; ${borderStyle} position: relative; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1">
                <div style="font-size: 13px; font-weight: 700; color: var(--text-color, #1e293b);">
                    ${icon} ${m.name} (${birthYear})
                </div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                    ${m.title} • Born on ${m.dob}
                </div>
            </div>
        `;
    }).join('');
}

// Intercept incoming sheets packets streams to inject the timeline lists array map
const standardProcessPacket = window.processFamilyArrayPacket;
window.processFamilyArrayPacket = function(rawData) {
    if (typeof standardProcessPacket === "function") {
        standardProcessPacket(rawData);
    }
    setTimeout(buildFamilyHistoricalTimeline, 200);
};
