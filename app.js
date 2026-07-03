const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwYd3QUIrfyjyqcC76b9uPGjdlHfgnWE4Kwi0bRUrT4m45D1L5vBdCG6-35Ut1y2qJ4/exec";
const SCRIPT_URL_WITH_CALLBACK = `${GAS_API_URL}?callback=renderTreeCallback`;

let familyDataArray = [];
let familyMembersCache = {};
let currentEditingMemberId = null;
let currentActiveDirectoryFilterTag = "all";
let globalActiveSelectedMobileNumber = ""; 

let selectedAppSessionVerse = { tamil: "", english: "", ref: "" };

function triggerAppHapticBump() {
    if (navigator.vibrate) { navigator.vibrate(12); }
}

function initializeAppSessionDailyBreadRotation() {
    try {
        const cachedVerse = sessionStorage.getItem("active_session_verse_packet");
        if (cachedVerse) {
            selectedAppSessionVerse = JSON.parse(cachedVerse);
        } else {
            let activeBank = [
                { text: "I can do all things through Christ who strengthens me.", tamil: "என்னைப் பெலப்படுத்துகிற கிறிஸ்துவினாலே எல்லாவற்றையும் செய்ய எனக்குப் பெலனுண்டு.", ref: "பிலிப்பியர் / Philippians 4:13" }
            ];
            if (typeof BIBLE_VERSES_VAULT !== 'undefined' && BIBLE_VERSES_VAULT.length > 0) {
                activeBank = BIBLE_VERSES_VAULT;
            }
            const today = new Date();
            const dateKey = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();
            const verseIndex = dateKey % activeBank.length;
            const chosen = activeBank[verseIndex];
            
            selectedAppSessionVerse = {
                tamil: chosen.tamil || "",
                english: chosen.text || chosen.english || "",
                ref: chosen.ref || ""
            };
            sessionStorage.setItem("active_session_verse_packet", JSON.stringify(selectedAppSessionVerse));
        }
        
        const tEl = document.getElementById("splash-bread-tamil");
        const eEl = document.getElementById("splash-bread-english");
        const rEl = document.getElementById("splash-bread-ref");

        if (tEl) tEl.innerText = selectedAppSessionVerse.tamil;
        if (eEl) eEl.innerText = `"${selectedAppSessionVerse.english}"`;
        if (rEl) rEl.innerText = `— ${selectedAppSessionVerse.ref}`;
    } catch(e) { console.error("Error setting splash content:", e); }
}

window.dismissPremiumFullscreenSplash = function() {
    triggerAppHapticBump();
    const splashScreen = document.getElementById('premium-app-splash');
    if (splashScreen) {
        splashScreen.style.opacity = '0';
        splashScreen.style.visibility = 'hidden';
        setTimeout(() => { 
            splashScreen.remove(); 
            const inlineCard = document.getElementById("tree-inline-daily-bread-card");
            if (inlineCard) inlineCard.style.display = "block";
        }, 500);
    }
};

window.toggleInlineDailyBreadCardMinimize = function() {
    triggerAppHapticBump();
    const contentWrapper = document.getElementById("daily-bread-inner-content-wrapper");
    const mainCard = document.getElementById("tree-inline-daily-bread-card");
    if (!contentWrapper || !mainCard) return;

    if (contentWrapper.style.display !== "none") {
        contentWrapper.style.display = "none";
        mainCard.style.padding = "10px 20px";
        mainCard.style.margin = "6px 12px";
    } else {
        contentWrapper.style.display = "block";
        mainCard.style.padding = "20px";
        mainCard.style.margin = "12px";
    }
};

function toggleNativeAppDarkMode() {
    triggerAppHapticBump();
    const body = document.body;
    const btn = document.getElementById("dark-mode-toggle-btn");
    body.classList.toggle("dark-theme-mode-active");
    if(body.classList.contains("dark-theme-mode-active")) {
        btn.innerText = "☀️";
        localStorage.setItem("native_app_theme_choice", "dark");
    } else {
        btn.innerText = "🌙";
        localStorage.setItem("native_app_theme_choice", "light");
    }
}

window.previewAndVerifySelectedPhoto = function(input) {
    const statusBadge = document.getElementById("form-photo-status-badge");
    if (input.files && input.files[0]) {
        const file = input.files[0];
        statusBadge.innerText = "✅ Ready (" + (file.size / 1024).toFixed(0) + " KB)";
        statusBadge.style.color = "#00a884";
    }
};

window.executeNativePhoneCallIntent = function() {
    if(!globalActiveSelectedMobileNumber) return;
    triggerAppHapticBump();
    window.open("tel:" + globalActiveSelectedMobileNumber, "_system");
};

window.executeNativeWhatsAppIntent = function() {
    if(!globalActiveSelectedMobileNumber) return;
    triggerAppHapticBump();
    window.open("https://wa.me/" + (globalActiveSelectedMobileNumber.includes('+') ? globalActiveSelectedMobileNumber : '+91' + globalActiveSelectedMobileNumber), "_system");
};

function reloadLiveFamilyData() {
    const oldScript = document.getElementById("jsonp-data-script");
    if (oldScript) oldScript.remove();
    const script = document.createElement("script");
    script.id = "jsonp-data-script";
    script.src = `${SCRIPT_URL_WITH_CALLBACK}&nocache=${new Date().getTime()}`;
    document.body.appendChild(script);
}

window.renderTreeCallback = function(rawData) {
    if (!rawData) return;
    try {
        localStorage.setItem("cached_family_tree_data", JSON.stringify(rawData));
        processFamilyArrayPacket(rawData);
    } catch (err) { console.error(err); }
};

function processFamilyArrayPacket(rawData) {
    familyDataArray = rawData.map((item, index) => {
        let cleanPhotoUrl = "";
        if (item.photoUrl && item.photoUrl.toString().trim() !== "") {
            let rawUrl = item.photoUrl.toString().trim();
            let driveIdMatch = rawUrl.match(/(?:id=|\/d\/)([a-zA-Z0-9-_]{25,45})/);
            if (driveIdMatch && driveIdMatch[1]) {
                cleanPhotoUrl = "https://lh3.googleusercontent.com/u/0/d/" + driveIdMatch[1];
            } else { cleanPhotoUrl = rawUrl; }
        }

        const titleText = item.occupation ? item.occupation.toString().trim() : "Family Member";
        const nameText = item.name ? item.name.toString().trim() : "Unknown Name";
        const isDeceased = titleText.toLowerCase().includes("late") || titleText.toLowerCase().includes("passed away") || titleText.includes("இறப்பு");

        return {
            id: item.id ? item.id.toString().trim() : (index + 1).toString(),
            name: isDeceased && !nameText.startsWith("Late") ? "Late " + nameText : nameText,
            gender: item.gender ? item.gender.toString().trim() : "",
            dob: item.dob ? item.dob.toString().trim() : "Not Provided",
            anniversary: item.anniversaryDate ? item.anniversaryDate.toString().trim() : "Not Provided",
            fatherId: item.fatherId ? item.fatherId.toString().trim() : "",
            spouseId: item.spouseId ? item.spouseId.toString().trim() : "",
            mobile: item.mobile ? item.mobile.toString().trim() : "Not Provided",
            blood: item.bloodGroup ? item.bloodGroup.toString().trim() : "Not Provided",
            title: titleText,
            address: item.address ? item.address.toString().trim() : "Not Provided",
            photo: cleanPhotoUrl,
            isDeceased: isDeceased
        };
    });

    familyMembersCache = {};
    familyDataArray.forEach(item => familyMembersCache[item.id] = item);

    buildTreeChartUI();
    executeDirectoryFilterUIRenderLines();
    updateFormDropdowns();
    updateRelationshipCalculatorDropdowns();
    calculateWowFamilyAnalytics();
    checkUpcomingBirthdaysAndAnniversariesCombinedEngine();
    
    buildFamilyLocationMapsEngine();
    buildHeritagePhotoVaultGallery();
    setTimeout(buildFamilyHistoricalTimelineCore, 250);
    
    const tB = document.getElementById("tree-bread-tamil");
    const eB = document.getElementById("tree-bread-english");
    const rB = document.getElementById("tree-bread-ref");
    if(tB) tB.innerText = selectedAppSessionVerse.tamil;
    if(eB) eB.innerText = `"${selectedAppSessionVerse.english}"`;
    if(rB) rB.innerText = `— ${selectedAppSessionVerse.ref}`;

    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.style.display = "none";
}

function getSmartAgeAndBadges(dobString, isDeceased) {
    if (!dobString || dobString === "Not Provided" || !dobString.includes('/') || isDeceased) return null;
    
    const parts = dobString.split('/');
    if(parts.length !== 3) return null;
    
    const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }

    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (today > nextBirthday) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const oneDay = 24 * 60 * 60 * 1000;
    const daysToNext = Math.round(Math.abs((nextBirthday - today) / oneDay));
    
    let badgesHTML = "";
    if (age >= 90) badgesHTML += `<div style="background:#fef08a; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold; color:#854d0e;">👑 Heritage Pillar</div>`;
    if (age <= 10) badgesHTML += `<div style="background:#dcfce7; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold; color:#166534;">🌱 Future Legacy</div>`;

    return { age, daysToNext, badgesHTML };
}

function checkUpcomingBirthdaysAndAnniversariesCombinedEngine() {
    const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');
    let bdayList = [];
    let anniversaryList = [];
    let processedCouples = new Set();

    familyDataArray.forEach(m => {
        if (m.isDeceased) return;

        if (m.dob && m.dob.includes('-')) {
            let parts = m.dob.split('-');
            if (parts[1] === currentMonthStr) { bdayList.push(m.name); }
        } else if (m.dob && m.dob.includes('/')) {
            let parts = m.dob.split('/');
            if (parts[1] === currentMonthStr) { bdayList.push(m.name); }
        }

        let anniversaryDateStr = m.anniversary;
        if (anniversaryDateStr && anniversaryDateStr !== "Not Provided" && anniversaryDateStr.trim() !== "") {
            let parts = anniversaryDateStr.includes('-') ? anniversaryDateStr.split('-') : anniversaryDateStr.split('/');
            let monthPart = parts[1];
            if (monthPart && monthPart.padStart(2, '0') === currentMonthStr) {
                if (m.spouseId && familyMembersCache[m.spouseId]) {
                    const partner = familyMembersCache[m.spouseId];
                    if (!processedCouples.has(m.id) && !processedCouples.has(partner.id)) {
                        anniversaryList.push(`💕 ${m.name} & ${partner.name}`);
                        processedCouples.add(m.id);
                        processedCouples.add(partner.id);
                    }
                } else if (!m.spouseId) {
                    anniversaryList.push(`💕 ${m.name}`);
                }
            }
        }
    });

    const widget = document.getElementById("birthday-reminder-widget");
    const listElement = document.getElementById("birthday-names-list");
    const anniListElement = document.getElementById("anniversary-names-list");

    let showWidget = false;

    if (bdayList.length > 0 && listElement) {
        listElement.innerHTML = bdayList.map(name => `<div class="birthday-user-tag">🎂 ${name}</div>`).join('');
        showWidget = true;
    } else if (listElement) {
        listElement.innerHTML = `<div style="font-size:11px; color:#94a3b8; font-style:italic; padding:4px;">No birthdays this month.</div>`;
    }

    if (anniversaryList.length > 0 && anniListElement) {
        anniListElement.innerHTML = anniversaryList.map(row => `<div class="birthday-user-tag" style="background:#fff5f7; color:#db2777; border-color:#fbcfe8;">🎉 ${row}</div>`).join('');
        showWidget = true;
    } else if (anniListElement) {
        anniListElement.innerHTML = `<div style="font-size:11px; color:#94a3b8; font-style:italic; padding:4px;">No anniversaries this month.</div>`;
    }

    if (widget) widget.style.display = showWidget ? "block" : "none";
}

function buildFamilyLocationMapsEngine() {
    const container = document.getElementById("family-locations-chips-container");
    if (!container || !familyDataArray) return;
    let uniqueLocations = new Set();
    familyDataArray.forEach(m => {
        if (m.address && m.address !== "Not Provided" && m.address.trim() !== "") {
            uniqueLocations.add(m.address.trim());
        }
    });
    if (uniqueLocations.size === 0) {
        container.innerHTML = `<span style="font-size:12px; color:#64748b; font-style:italic;">No addresses registered.</span>`;
        return;
    }
    container.innerHTML = Array.from(uniqueLocations).map(loc => {
        return `<div class="location-chip" onclick="executeNativeMapRedirectionIntent('${encodeURIComponent(loc)}')">📍 ${loc}</div>`;
    }).join('');
}

window.executeNativeMapRedirectionIntent = function(encodedLocation) {
    triggerAppHapticBump();
    window.open(`http://googleusercontent.com/maps.google.com/4{encodedLocation}`, "_system");
};

function buildHeritagePhotoVaultGallery() {
    const galleryGrid = document.getElementById("family-photo-vault-gallery-grid");
    if (!galleryGrid || !familyDataArray) return;
    let membersWithPhotos = familyDataArray.filter(m => m.photo && m.photo.trim() !== "");
    if (membersWithPhotos.length === 0) {
        galleryGrid.innerHTML = `<div style="grid-column: span 3; font-size:12px; color:#64748b; text-align:center; padding:10px; font-style:italic;">Vault is currently empty.</div>`;
        return;
    }
    galleryGrid.innerHTML = membersWithPhotos.map(m => {
        return `
            <div class="gallery-vault-card" onclick="window.openProfileModal('${m.id}')">
                <img src="${m.photo}" class="gallery-vault-img" alt="vault-photo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/4140/4140037.png'">
                <div class="gallery-vault-name">${m.name}</div>
            </div>
        `;
    }).join('');
}

function buildFamilyHistoricalTimelineCore() {
    const timelineContainer = document.getElementById("family-historical-timeline");
    if (!timelineContainer || !familyDataArray || familyDataArray.length === 0) return;

    let chronologicalRecords = familyDataArray.filter(m => m.dob && m.dob.includes('/'));
    chronologicalRecords.sort((a, b) => {
        const yearA = parseInt(a.dob.split('/')[2], 10);
        const yearB = parseInt(b.dob.split('/')[2], 10);
        return yearA - yearB;
    });

    const getTimelineItemHTML = (m) => {
        const borderStyle = m.isDeceased ? "border-left: 3px solid #64748b;" : "border-left: 3px solid #00a884;";
        const icon = m.isDeceased ? "🕊️" : "🌳";
        const birthYear = m.dob.split('/')[2];
        return `
            <div onclick="window.openProfileModal('${m.id}')" style="padding: 6px 0 6px 12px; ${borderStyle} position: relative; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1">
                <div style="font-size: 13px; font-weight: 700; color: var(--text-color, #1e293b);">
                    ${icon} ${m.name} (${birthYear})
                </div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                    ${m.title} • Born on ${m.dob}
                </div>
            </div>
        `;
    };

    let topFiveMilestones = chronologicalRecords.slice(0, 5);
    let extensionMilestones = chronologicalRecords.slice(5);
    let finalHTML = topFiveMilestones.map(getTimelineItemHTML).join('');

    if (extensionMilestones.length > 0) {
        finalHTML += `
            <div id="hidden-timeline-extension-wrapper" style="display: none; flex-direction: column; gap: 14px;">
                ${extensionMilestones.map(getTimelineItemHTML).join('')}
            </div>
            <button id="timeline-toggle-accordion-btn" onclick="toggleFullHistoricalTimelineAccordionView()" style="width: 100%; margin-top: 8px; background: transparent; border: 1px dashed #3b82f6; color: #3b82f6; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;">
                🔽 View Full Timeline (+${extensionMilestones.length} More)
            </button>
        `;
    }
    timelineContainer.innerHTML = finalHTML;
}

window.toggleFullHistoricalTimelineAccordionView = function() {
    triggerAppHapticBump();
    const extensionWrapper = document.getElementById("hidden-timeline-extension-wrapper");
    const toggleButton = document.getElementById("timeline-toggle-accordion-btn");
    if (!extensionWrapper || !toggleButton) return;

    if (extensionWrapper.style.display === "none") {
        extensionWrapper.style.display = "flex";
        toggleButton.innerText = "🔼 Collapse Timeline View";
    } else {
        extensionWrapper.style.display = "none";
        const extraCount = familyDataArray.filter(m => m.dob && m.dob.includes('/')).length - 5;
        toggleButton.innerText = `🔽 View Full Timeline (+${extraCount} More)`;
    }
};

function calculateWowFamilyAnalytics() {
    const totalCountEl = document.getElementById("stat-total-count");
    const maleCountEl = document.getElementById("stat-male-count");
    const femaleCountEl = document.getElementById("stat-female-count");
    const topBloodEl = document.getElementById("stat-top-blood");
    const pillarsCountEl = document.getElementById("milestone-pillars-count");
    const emergencyCountEl = document.getElementById("milestone-emergency-count");

    const genderPctEl = document.getElementById("progress-gender-pct");
    const genderFillEl = document.getElementById("progress-gender-fill");
    const lineagePctEl = document.getElementById("progress-lineage-pct");
    const lineageFillEl = document.getElementById("progress-lineage-fill");

    const totalCount = familyDataArray.length;
    if (totalCountEl) totalCountEl.innerText = totalCount;
    
    let males = familyDataArray.filter(m => m.gender === 'ஆண்' || m.gender.toLowerCase() === 'male').length;
    let females = familyDataArray.filter(m => m.gender === 'பெண்' || m.gender.toLowerCase() === 'female').length;
    
    if (maleCountEl) maleCountEl.innerText = males;
    if (femaleCountEl) femaleCountEl.innerText = females;

    let bloodCounts = {};
    let rareBloodCount = 0;
    let spiritualPillarsCount = 0;
    let pioneersCount = 0;
    let descendantsCount = 0;
    const currentYear = new Date().getFullYear();

    familyDataArray.forEach(m => { 
        if (!m.fatherId || m.fatherId === "") { pioneersCount++; } else { descendantsCount++; }
        if (!m.isDeceased) {
            if(m.blood && m.blood !== "Not Provided") { 
                bloodCounts[m.blood] = (bloodCounts[m.blood] || 0) + 1; 
                if (m.blood.includes('-') || m.blood.toLowerCase() === 'ab+') { rareBloodCount++; }
            } 
            if (m.dob && m.dob.includes('/')) {
                const parts = m.dob.split('/');
                if (parts.length === 3) {
                    const birthYear = parseInt(parts[2], 10);
                    if (!isNaN(birthYear) && (currentYear - birthYear) >= 70) { spiritualPillarsCount++; }
                }
            }
        }
    });
    
    let topBlood = "O+";
    let max = 0;
    for(let b in bloodCounts) { if(bloodCounts[b] > max) { max = bloodCounts[b]; topBlood = b; } }
    
    if (topBloodEl) topBloodEl.innerText = topBlood;
    if (pillarsCountEl) pillarsCountEl.innerText = spiritualPillarsCount;
    if (emergencyCountEl) emergencyCountEl.innerText = rareBloodCount;

    if (totalCount > 0) {
        const malePct = Math.round((males / totalCount) * 100);
        const femalePct = 100 - malePct;
        if (genderPctEl) genderPctEl.innerText = `${malePct}% / ${femalePct}%`;
        if (genderFillEl) genderFillEl.style.width = `${malePct}%`;

        const pioneerPct = Math.round((pioneersCount / totalCount) * 100);
        const descendantPct = 100 - pioneerPct;
        if (lineagePctEl) lineagePctEl.innerText = `${pioneerPct}% / ${descendantPct}%`;
        if (lineageFillEl) lineageFillEl.style.width = `${pioneerPct}%`;
    }
}

function formatDateToISOInput(dateStr) {
    if (!dateStr || dateStr === "Not Provided") return "";
    var parts = dateStr.split('/');
    if (parts.length === 3) {
        return parts[2] + "-" + parts[1].padStart(2, '0') + "-" + parts[0].padStart(2, '0');
    }
    return dateStr;
}

window.switchTab = function(tabName, element) {
    triggerAppHapticBump();
    document.querySelectorAll(".app-screen").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    
    const screenEl = document.getElementById(`screen-${tabName}`);
    if (screenEl) screenEl.classList.add("active");
    
    if (element) { element.classList.add("active"); } else {
        let navIdx = 0;
        if (tabName === 'list') navIdx = 1;
        if (tabName === 'dashboard') navIdx = 2;
        const targetNavNode = document.querySelectorAll(".nav-item")[navIdx];
        if (targetNavNode) targetNavNode.classList.add("active");
    }
    
    const fab = document.getElementById("app-floating-btn");
    if (fab) { fab.style.display = (tabName === 'add') ? "none" : "flex"; }
    if (tabName === 'add' && !currentEditingMemberId) { clearFormFieldsInputs(); }
    
    const mainContent = document.getElementById("app-main-content");
    if (tabName === 'tree') {
        document.body.style.overflow = "hidden";
        if (mainContent) { mainContent.style.overflow = "hidden"; mainContent.style.height = "calc(100vh - 128px)"; }
        setTimeout(centerTree, 80);
    } else {
        document.body.style.overflow = "auto";
        if (mainContent) { mainContent.style.height = "auto"; mainContent.style.overflowY = "auto"; }
    }
    
    const headerTitle = document.getElementById("header-title");
    const headerSubtitle = document.getElementById("header-subtitle");
    if (!headerTitle || !headerSubtitle) return;
    
    headerTitle.innerText = "Arulappan -Mary Family";
    if (tabName === 'tree') { headerSubtitle.innerText = "Preserving Our Legacy Forever"; }
    else if (tabName === 'list') { headerSubtitle.innerText = "Search & Browse All Members"; }
    else if (tabName === 'dashboard') { headerSubtitle.innerText = "Family Insights & Statistics Dashboard"; }
    else if (tabName === 'add') { headerSubtitle.innerText = "Grow Our Tree Registry"; }

    const dailyBreadBanner = document.getElementById("tree-inline-daily-bread-card");
    if (dailyBreadBanner) {
        const splashScreenActive = document.getElementById("premium-app-splash");
        if (tabName === 'tree' && !splashScreenActive) {
            dailyBreadBanner.style.display = "block";
        } else {
            dailyBreadBanner.style.display = "none";
        }
    }
};

window.applyMilestoneFilter = function(mode, element) {
    triggerAppHapticBump();
    currentActiveDirectoryFilterTag = mode;
    executeDirectoryFilterUIRenderLines();
    window.switchTab('list');
    document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
};

window.applyDirectoryGenerationFilter = function(filterMode, element) {
    triggerAppHapticBump();
    document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
    if(element) element.classList.add("active");
    currentActiveDirectoryFilterTag = filterMode;
    executeDirectoryFilterUIRenderLines();
}

function isSpecialDayToday(dateStr) {
    if (!dateStr || dateStr === "Not Provided" || dateStr.trim() === "") return false;
    
    const today = new Date();
    const currentMonthStr = String(today.getMonth() + 1).padStart(2, '0');
    const currentDayStr = String(today.getDate()).padStart(2, '0');
    
    let parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
    if (parts.length < 2) return false;

    let dayPart = parts[0];
    let monthPart = parts[1];

    if (parts[0].length === 4) {
        monthPart = parts[1];
        dayPart = parts[2];
    }

    return (monthPart.padStart(2, '0') === currentMonthStr && dayPart.padStart(2, '0') === currentDayStr);
}

function executeDirectoryFilterUIRenderLines() {
    const query = document.getElementById("member-search-input") ? document.getElementById("member-search-input").value.toLowerCase().trim() : "";
    let dataset = [...familyDataArray];
    const currentYear = new Date().getFullYear();

    if(currentActiveDirectoryFilterTag === 'ancestors') {
        dataset = dataset.filter(m => !m.fatherId || m.fatherId === "");
    } else if(currentActiveDirectoryFilterTag === 'descendants') {
        dataset = dataset.filter(m => m.fatherId && m.fatherId !== "");
    } else if(currentActiveDirectoryFilterTag === 'pillars') {
        dataset = dataset.filter(m => {
            if (!m.isDeceased && m.dob && m.dob.includes('/')) {
                const parts = m.dob.split('/');
                return parts.length === 3 && (currentYear - parseInt(parts[2], 10)) >= 70;
            }
            return false;
        });
    } else if(currentActiveDirectoryFilterTag === 'rare') {
        dataset = dataset.filter(m => !m.isDeceased && m.blood && (m.blood.includes('-') || m.blood.toLowerCase() === 'ab+'));
    }

    if(query) {
        dataset = dataset.filter(m => m.name.toLowerCase().includes(query) || m.title.toLowerCase().includes(query));
    }
    
    dataset.sort((a, b) => {
        const aIsBday = (!a.isDeceased && isSpecialDayToday(a.dob)) ? 1 : 0;
        const aIsAnni = (!a.isDeceased && isSpecialDayToday(a.anniversary)) ? 1 : 0;
        const aScore = aIsBday + aIsAnni;
        
        const bIsBday = (!b.isDeceased && isSpecialDayToday(b.dob)) ? 1 : 0;
        const bIsAnni = (!b.isDeceased && isSpecialDayToday(b.anniversary)) ? 1 : 0;
        const bScore = bIsBday + bIsAnni;
        
        return bScore - aScore;
    });

    buildDirectoryUI(dataset);
}

function updateFormDropdowns() {
    const fatherSelect = document.getElementById("form-father");
    const spouseSelect = document.getElementById("form-spouse");
    if (!fatherSelect || !spouseSelect) return;
    
    let fatherOptions = `<option value="">👤 None (Top Ancestor Layer)</option>`;
    let spouseOptions = `<option value="">👤 None (No Partner Linked)</option>`;
    
    const sortedMembers = [...familyDataArray].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedMembers.forEach(m => {
        const icon = (m.gender === 'பெண்' || m.gender.toLowerCase() === 'female') ? '👩' : '👨';
        const memorial = m.isDeceased ? '🕊️ ' : '';
        const cleanName = m.name.replace("Late ", ""); 
        const paddedId = m.id.toString().padStart(2, '0');
        const displayText = `${icon} [${paddedId}] ${memorial}${cleanName}`;
        
        fatherOptions += `<option value="${m.id}">${displayText}</option>`;
        spouseOptions += `<option value="${m.id}">${displayText}</option>`;
    });
    
    fatherSelect.innerHTML = fatherOptions;
    spouseSelect.innerHTML = spouseOptions;
}

function updateRelationshipCalculatorDropdowns() {
    const p1 = document.getElementById("relation-person-1");
    const p2 = document.getElementById("relation-person-2");
    if (!p1 || !p2) return;
    
    let options = `<option value="">Choose a Family Member...</option>`;
    const sortedMembers = [...familyDataArray].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedMembers.forEach(m => {
        const icon = (m.gender === 'பெண்' || m.gender.toLowerCase() === 'female') ? '👩' : '👨';
        options += `<option value="${m.id}">${icon} ${m.name.replace("Late ", "")}</option>`;
    });
    
    p1.innerHTML = options;
    p2.innerHTML = options;
}

window.calculateRelationship = function() {
    const id1 = document.getElementById("relation-person-1").value;
    const id2 = document.getElementById("relation-person-2").value;
    const resultDiv = document.getElementById("relation-result");
    
    if (!id1 || !id2) {
        resultDiv.style.display = "block";
        resultDiv.innerHTML = "⚠️ Please select two different people.";
        return;
    }
    if (id1 === id2) {
        resultDiv.style.display = "block";
        resultDiv.innerHTML = "😆 That's the same person!";
        return;
    }

    let graph = {};
    familyDataArray.forEach(m => graph[m.id] = []);
    
    familyDataArray.forEach(m => {
        if (m.fatherId && graph[m.fatherId]) {
            graph[m.id].push({id: m.fatherId, relation: "Parent"});
            graph[m.fatherId].push({id: m.id, relation: "Child"});
        }
        if (m.spouseId && graph[m.spouseId]) {
            graph[m.id].push({id: m.spouseId, relation: "Spouse"});
            graph[m.spouseId].push({id: m.id, relation: "Spouse"});
        }
    });

    let queue = [[id1]];
    let visited = new Set([id1]);
    let pathFound = null;

    while (queue.length > 0) {
        let path = queue.shift();
        let currentId = path[path.length - 1];

        if (currentId === id2) {
            pathFound = path;
            break;
        }

        if (graph[currentId]) {
            for (let neighbor of graph[currentId]) {
                if (!visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    queue.push([...path, neighbor.id]);
                }
            }
        }
    }

    resultDiv.style.display = "block";
    if (pathFound) {
        let connectionString = pathFound.map(nodeId => {
            const member = familyMembersCache[nodeId];
            const icon = (member.gender === 'பெண்' || member.gender.toLowerCase() === 'female') ? '👩' : '👨';
            return `${icon} ${member.name.replace("Late ", "")}`;
        }).join(" ➡️ ");
        resultDiv.innerHTML = `<strong>Connection Path:</strong><br><br>${connectionString}`;
    } else {
        resultDiv.innerHTML = "🤷 No direct connection found in the registry yet.";
    }
    triggerAppHapticBump();
};

function buildTreeChartUI() {
    const container = document.getElementById("html-tree-container");
    if (!container) return;
    const processedSpouseIds = new Set();
    const nodeMap = {};
    familyDataArray.forEach(item => { nodeMap[item.id] = { ...item, spouses: [], children: [] }; });
    familyDataArray.forEach(item => {
        if (item.spouseId && nodeMap[item.spouseId]) {
            if (!processedSpouseIds.has(item.id) && !processedSpouseIds.has(item.spouseId)) {
                nodeMap[item.id].spouses.push(nodeMap[item.spouseId]);
                processedSpouseIds.add(item.spouseId);
            }
        }
    });
    const roots = [];
    familyDataArray.forEach(item => {
        const node = nodeMap[item.id];
        if (processedSpouseIds.has(item.id) && !item.fatherId) return;
        if (item.fatherId && nodeMap[item.fatherId]) {
            nodeMap[item.fatherId].children.push(node);
        } else if (item.spouseId && nodeMap[item.spouseId] && nodeMap[item.spouseId].fatherId && nodeMap[nodeMap[item.spouseId].fatherId]) {
            nodeMap[nodeMap[item.spouseId].fatherId].children.push(node);
        } else { roots.push(node); }
    });
    function renderNodeBlock(node) {
        const getCardHTML = (m) => {
            const isFemale = (m.gender === 'பெண்' || m.gender.toLowerCase() === 'female');
            const avatar = m.photo || (isFemale ? 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' : 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png');
            const deceasedStyle = m.isDeceased ? 'style="opacity: 0.55; border-left: 5px solid #64748b;"' : '';
            const memorialBadge = m.isDeceased ? '🕊️ ' : '';
            return `<div class="node-card ${isFemale ? 'female' : ''}" ${deceasedStyle} data-node-id="${m.id}" data-search-name="${m.name.toLowerCase()}" onclick="openProfileModal('${m.id}')"><img src="${avatar}" crossorigin="anonymous" alt="avatar" class="node-avatar"><div class="node-info"><div class="node-name">${memorialBadge}${m.name}</div><div class="node-title">${m.title}</div></div></div>`;
        };
        let rowHTML = `<div class="node-couple-row">${getCardHTML(node)}`;
        node.spouses.forEach(s => rowHTML += getCardHTML(s));
        rowHTML += `</div>`;
        let html = `<li>${rowHTML}`;
        if (node.children && node.children.length > 0) { html += '<ul>' + node.children.map(renderNodeBlock).join('') + '</ul>'; }
        html += '</li>';
        return html;
    }
    if (roots.length > 0) { container.innerHTML = `<ul>${roots.map(renderNodeBlock).join('')}</ul>`; setTimeout(centerTree, 150); }
}

function buildDirectoryUI(dataset) {
    const listContainer = document.getElementById("members-directory-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = dataset.map(m => {
        const isFemale = (m.gender === 'பெண்' || m.gender.toLowerCase() === 'female');
        const avatar = m.photo || (isFemale ? 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' : 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png');
        const memorialLabel = m.isDeceased ? ' 🕊️ Legacy' : ` • ${m.gender}`;
        const deceasedItemStyle = m.isDeceased ? 'style="background: rgba(241, 245, 249, 0.6); opacity: 0.75;"' : '';
        
        let specialEventBadges = "";
        if (!m.isDeceased) {
            if (isSpecialDayToday(m.dob)) {
                specialEventBadges += `<div class="directory-badge" style="display: inline-block; background: #fef08a; color: #a16207; border: 1px solid #fde047; margin-top: 6px; margin-right: 4px;">🎂 Today's Birthday</div>`;
            }
            if (isSpecialDayToday(m.anniversary)) {
                specialEventBadges += `<div class="directory-badge" style="display: inline-block; background: #fbcfe8; color: #be185d; border: 1px solid #f9a8d4; margin-top: 6px;">🎉 Today's Anniversary</div>`;
            }
        }

        return `<div class="directory-item" ${deceasedItemStyle} onclick="openProfileModal('${m.id}')">
            <img src="${avatar}" alt="photo" class="directory-avatar">
            <div class="directory-details">
                <div class="directory-name">${m.name}</div>
                <div class="directory-meta">${m.title} • ID: ${m.id}</div>
                ${specialEventBadges}
            </div>
            <div class="directory-badge ${isFemale ? 'female' : ''}" style="align-self: flex-start;">${memorialLabel}</div>
        </div>`;
    }).join('');
}

window.openProfileModal = function(id) {
    triggerAppHapticBump();
    const member = familyMembersCache[id];
    if (!member) return;
    
    const isFemale = (member.gender === 'பெண்' || member.gender.toLowerCase() === 'female');
    const avatar = member.photo || (isFemale ? 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' : 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png');
    
    document.getElementById("modal-avatar").src = avatar;
    document.getElementById("modal-name").innerText = member.name;
    document.getElementById("modal-gender").innerText = member.gender;
    document.getElementById("modal-dob").innerText = member.dob;
    document.getElementById("modal-anniversary-display").innerText = member.anniversary || "Not Provided";
    document.getElementById("modal-blood").innerText = member.blood;
    document.getElementById("modal-title").innerText = member.title;
    document.getElementById("modal-phone").innerText = member.mobile;
    document.getElementById("modal-address").innerText = member.address;
    
    const ageData = getSmartAgeAndBadges(member.dob, member.isDeceased);
    const countdownEl = document.getElementById("modal-age-countdown");
    const badgeEl = document.getElementById("modal-smart-badges");
    
    if (ageData) {
        let txt = `Age: ${ageData.age} years`;
        if (ageData.daysToNext === 0) txt += ` • 🎉 Happy Birthday!`;
        else txt += ` • ${ageData.daysToNext} days to next birthday`;
        countdownEl.innerText = txt;
        countdownEl.style.display = "block";
        badgeEl.innerHTML = ageData.badgesHTML;
    } else {
        countdownEl.style.display = "none";
        badgeEl.innerHTML = "";
    }

    globalActiveSelectedMobileNumber = member.mobile.replace(/\s+/g, '');
    document.getElementById("profile-modal").setAttribute("data-active-id", id);
    document.getElementById("profile-modal").classList.add("active");
};

window.downloadTreePoster = function() {
    triggerAppHapticBump();
    const treeDiv = document.getElementById("html-tree-container");
    if (!treeDiv) return;
    
    document.getElementById("loading-overlay").style.display = "flex";
    document.getElementById("loading-overlay-text").innerText = "Generating Poster...";
    
    html2canvas(treeDiv, { scale: 2, useCORS: true, backgroundColor: "#eae6df" }).then(canvas => {
        const link = document.createElement("a");
        link.download = `Family_Tree_Poster_${new Date().getFullYear()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        document.getElementById("loading-overlay").style.display = "none";
    }).catch(() => {
        alert("Error capturing tree. Please try again.");
        document.getElementById("loading-overlay").style.display = "none";
    });
};

window.generateWhatsAppCard = function() {
    triggerAppHapticBump();
    const id = document.getElementById("profile-modal").getAttribute("data-active-id");
    const member = familyMembersCache[id];
    if (!member) return;

    document.getElementById("loading-overlay").style.display = "flex";
    document.getElementById("loading-overlay-text").innerText = "Creating Share Card...";

    document.getElementById("wa-card-avatar").src = document.getElementById("modal-avatar").src;
    document.getElementById("wa-card-name").innerText = member.name.replace("Late ", "");
    document.getElementById("wa-card-title").innerText = member.title;
    document.getElementById("wa-card-id").innerText = member.id;
    document.getElementById("wa-card-blood").innerText = member.blood !== "Not Provided" ? member.blood : "N/A";

    setTimeout(() => {
        const cardTemplate = document.getElementById("whatsapp-card-template");
        html2canvas(cardTemplate, { scale: 3, useCORS: true, backgroundColor: null }).then(canvas => {
            const link = document.createElement("a");
            link.download = `${member.name.replace(/\s/g, '_')}_Family_Card.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            document.getElementById("loading-overlay").style.display = "none";
            
            if (typeof confetti === "function") confetti({ particleCount: 150, spread: 80, zIndex: 100001 });
        }).catch(err => {
            alert("Card generation blocked by browser security (CORS). Please try on a standard photo.");
            document.getElementById("loading-overlay").style.display = "none";
        });
    }, 500);
};

window.closeProfileModal = function() { document.getElementById("profile-modal").classList.remove("active"); currentEditingMemberId = null; };
window.openFullscreenPhotoZoom = function() { const currentSrc = document.getElementById("modal-avatar").src; if (currentSrc) { document.getElementById("fullscreen-target-img").src = currentSrc; document.getElementById("fullscreen-viewer").style.display = "flex"; } };
window.closeFullscreenPhotoZoom = function() { document.getElementById("fullscreen-viewer").style.display = "none"; };

window.triggerEditFormActionLocal = function() {
    const activeId = document.getElementById("profile-modal").getAttribute("data-active-id");
    const member = familyMembersCache[activeId];
    if (!member) return;
    currentEditingMemberId = activeId.toString(); 
    
    const safeSetVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
    safeSetVal("form-name", member.name.replace("Late ", "")); 
    safeSetVal("form-gender", member.gender); 
    safeSetVal("form-dob", formatDateToISOInput(member.dob));
    safeSetVal("form-anniversary", formatDateToISOInput(member.anniversary));
    safeSetVal("form-father", member.fatherId); 
    safeSetVal("form-spouse", member.spouseId); 
    safeSetVal("form-blood", member.blood);
    safeSetVal("form-title", member.title); 
    safeSetVal("form-mobile", member.mobile === "Not Provided" ? "" : member.mobile); 
    safeSetVal("form-address", member.address === "Not Provided" ? "" : member.address);
    safeSetVal("form-photo-url-hidden", member.photo); 
    
    const statusBadge = document.getElementById("form-photo-status-badge");
    if(statusBadge && member.photo) { statusBadge.innerText = "🔄 Keeping existing profile photo"; statusBadge.style.color = "#00a884"; }

    document.getElementById("profile-modal").classList.remove("active"); 
    window.switchTab('add');
    
    // ✅ Safety checked editing title change
    const formHeading = document.getElementById("form-heading");
    if (formHeading) formHeading.innerText = `✏️ Editing Profile: ${member.name}`;
};

window.triggerDeleteActionLocal = function() {
    const activeId = document.getElementById("profile-modal").getAttribute("data-active-id");
    if(confirm(`Are you sure you want to remove family ID entry reference ${activeId}?`)) {
        familyDataArray = familyDataArray.filter(item => item.id !== activeId);
        buildTreeChartUI(); executeDirectoryFilterUIRenderLines(); closeProfileModal();
    }
};

let scale = 0.85, posX = 0, posY = 20, startX = 0, startY = 0, isDragging = false, touchStartDist = 0, lastScale = 0.85, lastTouchX = 0, lastTouchY = 0, viewport = null, canvas = null;
function updateTransform() { if (canvas) { canvas.style.transformOrigin = "0 0"; canvas.style.transform = `translate3d(${posX}px, ${posY}px, 0) scale(${scale})`; } }
function centerTree() { if (viewport && canvas) { posX = (viewport.clientWidth - (canvas.clientWidth * scale)) / 2; posY = 40; updateTransform(); } }

function initializeMultiDirectionalPanEngine() {
    viewport = document.getElementById('tree-viewport'); canvas = document.getElementById('zoom-canvas');
    if (!viewport || !canvas) return;
    viewport.style.overflow = "hidden"; canvas.style.transformOrigin = "0 0";
    viewport.addEventListener('mousedown', (e) => { if (!document.getElementById("screen-tree").classList.contains("active") || e.target.closest('.node-card')) return; isDragging = true; startX = e.clientX - posX; startY = e.clientY - posY; viewport.style.cursor = 'grabbing'; });
    window.addEventListener('mousemove', (e) => { if (!isDragging) return; posX = e.clientX - startX; posY = e.clientY - startY; updateTransform(); });
    window.addEventListener('mouseup', () => { isDragging = false; if(viewport) viewport.style.cursor = 'grab'; });
    viewport.addEventListener('touchstart', (e) => {
        if (!document.getElementById("screen-tree").classList.contains("active") || e.target.closest('.node-card')) return;
        if (e.touches.length === 1) { isDragging = true; lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; } 
        else if (e.touches.length === 2) { isDragging = false; touchStartDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); lastScale = scale; }
    });
    viewport.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length === 1) { posX += e.touches[0].clientX - lastTouchX; posY += e.touches[0].clientY - lastTouchY; lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; updateTransform(); } 
        else if (e.touches.length === 2) {
            const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            let newScale = Math.min(Math.max(lastScale * (dist / touchStartDist), 0.20), 2.0);
            let midX = (e.touches[0].clientX + e.touches[1].clientX) / 2, midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            posX -= (midX - posX) * (newScale - scale) / scale; posY -= (midY - posY) * (newScale - scale) / scale;
            scale = newScale; updateTransform();
        }
    });
    viewport.addEventListener('touchend', (e) => { isDragging = false; if (e.touches.length === 1) { isDragging = true; lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; } });
}

window.addEventListener('click', (event) => {
    const bibleCard = document.getElementById("dashboard-bible-card-container");
    const resultArea = document.getElementById("bible-search-result-area");
    const inputField = document.getElementById("bible-search-input-field");
    if (bibleCard && resultArea && !bibleCard.contains(event.target)) {
        resultArea.style.display = "none";
        resultArea.innerHTML = "";
        if (inputField) inputField.value = "";
    }
});

window.addEventListener('DOMContentLoaded', () => {
    initializeAppSessionDailyBreadRotation();
    const activeSavedThemeCache = localStorage.getItem("native_app_theme_choice");
    if(activeSavedThemeCache === 'dark') { document.body.classList.add("dark-theme-mode-active"); if(document.getElementById("dark-mode-toggle-btn")) document.getElementById("dark-mode-toggle-btn").innerText = "☀️"; }
    const treeSearchInput = document.getElementById("tree-instant-search-input");
    if (treeSearchInput) {
        treeSearchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim(); const allCards = document.querySelectorAll(".node-card");
            if (!query) { allCards.forEach(card => card.classList.remove("search-dimmed", "search-match-highlight")); return; }
            allCards.forEach(card => {
                const nameAttr = card.getAttribute("data-search-name") || "";
                if (nameAttr.includes(query)) { card.classList.remove("search-dimmed"); card.classList.add("search-match-highlight"); } else { card.classList.remove("search-match-highlight"); card.classList.add("search-dimmed"); }
            });
        });
    }
    const searchInput = document.getElementById("member-search-input");
    if (searchInput) { searchInput.addEventListener("input", () => { executeDirectoryFilterUIRenderLines(); }); }
    const phoneCachedData = localStorage.getItem("cached_family_tree_data");
    if (phoneCachedData) { processFamilyArrayPacket(JSON.parse(phoneCachedData)); }
    initializeMultiDirectionalPanEngine(); window.switchTab('tree'); reloadLiveFamilyData();
});

window.clearFormFieldsInputs = function() {
    const safeSetVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    safeSetVal("form-name", ""); safeSetVal("form-gender", "ஆண்"); safeSetVal("form-dob", "");
    safeSetVal("form-anniversary", ""); safeSetVal("form-father", ""); safeSetVal("form-spouse", "");
    safeSetVal("form-blood", ""); safeSetVal("form-title", ""); safeSetVal("form-mobile", "");
    safeSetVal("form-address", ""); safeSetVal("form-photo-url-hidden", ""); safeSetVal("form-photo-file-picker", "");
    const statusBadge = document.getElementById("form-photo-status-badge");
    if(statusBadge) { statusBadge.innerText = "No photo selected"; statusBadge.style.color = "var(--text-secondary-color)"; }
};

window.triggerFabAction = function() { 
    currentEditingMemberId = null; 
    clearFormFieldsInputs(); 
    
    // ✅ FIXED: Safely verify the heading ID exists before trying to edit text
    const formHeading = document.getElementById("form-heading");
    if (formHeading) formHeading.innerText = "➕ Add New Family Member";
    
    window.switchTab('add'); 
};

window.submitNewMemberLocal = function() {
    triggerAppHapticBump();
    const name = document.getElementById("form-name").value.trim();
    const gender = document.getElementById("form-gender").value;
    const dob = document.getElementById("form-dob").value.trim();
    const anniversary = document.getElementById("form-anniversary").value.trim();
    const fatherId = document.getElementById("form-father").value;
    const spouseId = document.getElementById("form-spouse").value;
    const blood = document.getElementById("form-blood").value;
    const title = document.getElementById("form-title").value.trim();
    const mobile = document.getElementById("form-mobile").value.trim();
    const address = document.getElementById("form-address").value.trim();
    const photoUrl = document.getElementById("form-photo-url-hidden").value.trim();

    if (!name) { alert("Please enter a name!"); return; }

    document.getElementById("loading-overlay").style.display = "flex";
    document.getElementById("loading-overlay-text").innerText = "Syncing with Cloud...";

    const filePicker = document.getElementById("form-photo-file-picker");
    if (filePicker.files && filePicker.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            sendFinalDataToGoogleCloud(name, gender, dob, anniversary, fatherId, spouseId, blood, title, mobile, address, photoUrl, e.target.result.split(",")[1]);
        };
        reader.readAsDataURL(filePicker.files[0]);
    } else {
        sendFinalDataToGoogleCloud(name, gender, dob, anniversary, fatherId, spouseId, blood, title, mobile, address, photoUrl, "");
    }
};

function showCustomSuccessToast() {
    triggerAppHapticBump();
    if (typeof confetti === "function") { confetti({ particleCount: 150, spread: 80, origin: { y: 0.4 }, zIndex: 100001 }); }
    const toast = document.createElement("div");
    toast.innerHTML = `<div style="font-size: 32px; margin-bottom: 8px;">✅</div><div style="font-weight: 700; font-size: 18px;">Success!</div><div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">Family record updated safely.</div>`;
    toast.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8); background: linear-gradient(135deg, #00a884, #005c4b); color: white; padding: 24px 32px; border-radius: 20px; text-align: center; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4); z-index: 100000; opacity: 0; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "1"; toast.style.transform = "translate(-50%, -50%) scale(1)"; }, 10);
    setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translate(-50%, -50%) scale(0.8)"; setTimeout(() => toast.remove(), 400); }, 3000);
}

function sendFinalDataToGoogleCloud(name, gender, dob, anniversary, fatherId, spouseId, blood, title, mobile, address, photoUrl, base64Data) {
    const payload = { 
        id: currentEditingMemberId || "", 
        name, gender, dob, anniversaryDate: anniversary, fatherId, spouseId, blood, title, mobile, address, photo: photoUrl, photoData: base64Data 
    };
    
    fetch(GAS_API_URL, { method: "POST", body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(data => {
        document.getElementById("loading-overlay").style.display = "none";
        showCustomSuccessToast();
        clearFormFieldsInputs();
        reloadLiveFamilyData();
        window.switchTab('tree');
    })
    .catch(err => {
        alert("Error saving: " + err);
        document.getElementById("loading-overlay").style.display = "none";
    });
}
