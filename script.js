const API_BASE_URL = 'http://127.0.0.1:3000';
const PASTOR_FILE = 'PastorMessage.txt';
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