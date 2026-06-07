const API_BASE_URL = 'http://127.0.0.1:3000';
const PASTOR_FILE = 'message.txt';
const MEETING_FILE = 'nextMeeting.txt';

async function saveTextFileViaServer(fileName, content) {
    try {
        const response = await fetch(`${API_BASE_URL}/save-file`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileName, content })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('Save server error', errorData);
            return false;
        }

        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.warn('Server save failed:', error);
        return false;
    }
}

function getTextareaValue(id) {
    const textarea = document.getElementById(id);
    return textarea ? textarea.value.trim() : '';
}

function showResult(message) {
    alert(message);
}

async function handleSubmit(fileName, textareaId, successMessage) {
    const value = getTextareaValue(textareaId);
    if (!value) {
        showResult('Please enter some text before submitting.');
        return;
    }

    const saved = await saveTextFileViaServer(fileName, value);
    if (saved) {
        showResult(successMessage);
    } else {
        showResult('Unable to save file. Please make sure the save server is running.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const messageButton = document.getElementById('submitMessage');
    const meetingButton = document.getElementById('submitMeeting');

    if (messageButton) {
        messageButton.addEventListener('click', () => {
            handleSubmit(PASTOR_FILE, 'pastorMessage', 'Pastor message saved successfully.');
        });
    }

    if (meetingButton) {
        meetingButton.addEventListener('click', () => {
            handleSubmit(MEETING_FILE, 'meetingPlace', 'Meeting place saved successfully.');
        });
    }

    initializeMeetingFooter();
});

function getNextSunday1030() {
    const now = new Date();
    const target = new Date(now);
    target.setHours(10, 30, 0, 0);

    const day = now.getDay();
    if (day === 0) {
        if (now <= target) {
            return target;
        }
        target.setDate(target.getDate() + 7);
        return target;
    }

    const daysUntilSunday = (7 - day) % 7;
    target.setDate(target.getDate() + daysUntilSunday);
    return target;
}

function formatMeetingTime(date) {
    const options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    };
    const dateString = date.toLocaleDateString(undefined, options);
    return `${dateString} at 10:30 AM`;
}

async function loadMeetingPlace() {
    const placeEl = document.getElementById('nextMeetingPlace');
    if (!placeEl) return;

    try {
        const response = await fetch(MEETING_FILE);
        if (response.ok) {
            const text = (await response.text()).trim();
            placeEl.textContent = text || 'Meeting place not set';
            return;
        }
    } catch (error) {
        // continue to fallback if HTTP fetch fails
    }

    if (window.location.protocol === 'file:') {
        placeEl.textContent = 'Please open this site through the local server at http://127.0.0.1:3000/';
        return;
    }

    if ('showOpenFilePicker' in window) {
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: 'Text file',
                        accept: { 'text/plain': ['.txt'] }
                    }
                ],
                multiple: false
            });
            const file = await handle.getFile();
            const text = (await file.text()).trim();
            placeEl.textContent = text || 'Meeting place not set';
            return;
        } catch (error) {
            if (error.name === 'AbortError') {
                placeEl.textContent = 'Meeting place not available';
                return;
            }
            console.warn('Load failed:', error);
        }
    }

    placeEl.textContent = 'Meeting place not available';
}

function initializeMeetingFooter() {
    const timeEl = document.getElementById('nextMeetingTime');
    if (timeEl) {
        const nextSunday = getNextSunday1030();
        timeEl.textContent = formatMeetingTime(nextSunday);
    }

    loadMeetingPlace();
}

const articles = 
    [
        "1. We believe in only one true and living God, and that a trinity of persons in the God-head, the Father, Son, and the Holy Ghost, the same in essence, equal in power and glory.",
        "2. We believe that the Scriptures of the Old and New Testaments, given by inspiration of God, are divine authority and the only rule of faith and practice.",
        "3. We believe in the fall of Adam, in the imputation of his sins to all his posterity, in the total depravity of human nature, and in man's inability to restore himself to the favor of god.",
        "4. We believe in the everlasting love of God for his people, in the eternal, unconditional election of a definite number of the human family to grace and glory.",
        "5. We believe that sinners are only justified in the sight of God by inputed righteousness of Jesus Christ, which is unto and upon all them that believe.",
        "6. We believe all those who were chosen in Christ before the foundation of the world are, in time, effectually called regenerated, concerted, and sanctified, and kept by the power of God through faith unto salvation.",
        "7. We believe there is one mediator between God and man, the man Christ Jesus, who, by the satisfaction he made to law and justice in becoming an offering for sin, hath by His most precious blood redeemed the elect from under the curse of the law, that they might be holy and without blame before him in love.",
        "8. We believe that good works are fruits of faith, and following after justification, are evidences of a gracious state, and it is the duty of all believers to perform them from a principle of love.",
        "9. We believe in the resurrection of the dead and a general judgement; that the happiness of the righteous and the punishment of the wicked will be everlasting.",

    ];

let index = 0;

const contentBox = document.getElementById("article-content");
const nextBtn = document.getElementById("next-article");
const prevBtn = document.getElementById("prev-article");

function showArticle(i) {
    contentBox.style.opacity = 0;
    setTimeout(() => {
        contentBox.textContent = articles[i];
        contentBox.style.opacity = 1;
    }, 200);
}

nextBtn.addEventListener("click", () => {
    index = (index + 1) % articles.length;
    showArticle(index);
});

prevBtn.addEventListener("click", () => {
    index = (index - 1 + articles.length) % articles.length;
    showArticle(index);
});

// Load first article
showArticle(index);

