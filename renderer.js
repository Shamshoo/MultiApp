const homePage = document.getElementById('home-page');
const notesBtn = document.getElementById('notes-btn');
const passwordManagerBtn = document.getElementById('password-manager-btn');
const container = document.querySelector('.container');
const passwordManagerPage = document.getElementById('password-manager-page');
const notesBackBtn = document.getElementById('notes-back-btn');
const pmBackBtn = document.getElementById('pm-back-btn');

passwordManagerBtn.addEventListener('click', () => {
    homePage.classList.add('fade-out');
    pmBackBtn.classList.remove('hidden');
    setTimeout(() => {
        homePage.classList.add('hidden');
        passwordManagerPage.classList.remove('hidden');
        setTimeout(() => {
            passwordManagerPage.classList.add('visible');
        }, 10);
    }, 500);
});

notesBackBtn.addEventListener('click', () => {
    container.classList.remove('fade-in');
    container.classList.add('fade-out');
    notesBackBtn.classList.add('hidden');
    setTimeout(() => {
        container.classList.add('hidden');
        homePage.classList.remove('hidden');
        homePage.classList.remove('fade-out');
        homePage.classList.add('fade-in');
    }, 500);
});

pmBackBtn.addEventListener('click', () => {
    passwordManagerPage.classList.remove('visible');
    pmBackBtn.classList.add('hidden');
    setTimeout(() => {
        passwordManagerPage.classList.add('hidden');
        homePage.classList.remove('hidden');
        homePage.classList.remove('fade-out');
        homePage.classList.add('fade-in');
    }, 500);
});

notesBtn.addEventListener('click', () => {
    homePage.classList.add('fade-out');
    notesBackBtn.classList.remove('hidden');
    setTimeout(() => {
        homePage.classList.add('hidden');
        container.classList.remove('hidden');
        container.classList.add('fade-in');
    }, 500);
});

document.getElementById('minimize-btn').addEventListener('click', () => {
    window.electronAPI.minimize();
});

document.getElementById('maximize-btn').addEventListener('click', () => {
    window.electronAPI.maximize();
});

document.getElementById('close-btn').addEventListener('click', () => {
    window.electronAPI.close();
});

const menuBtn = document.getElementById('menu-btn');
const menuOptions = document.getElementById('menu-options');
const addChannelBtn = document.getElementById('add-channel-btn');
const channelList = document.getElementById('channel-list');
const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('password-input');
const passwordSubmit = document.getElementById('password-submit');
const cancelPasswordBtn = document.getElementById('cancel-password-btn');
const notesContainer = document.getElementById('notes-container');
const noteInput = document.getElementById('note-input');
const searchInput = document.getElementById('search-input');
const searchResultsContainer = document.getElementById('search-results-container');
const searchResultsList = document.getElementById('search-results-list');
const searchResultsCount = document.getElementById('search-results-count');
const pinnedMessagesBtn = document.getElementById('pinned-messages-btn');
const pinnedMessagesDropdown = document.getElementById('pinned-messages-dropdown');
const sortBtns = document.querySelectorAll('.sort-btn');

let channels = {};
let activeChannel = null;
let passwordEntries = {};
let activePasswordEntry = null;

const uploadButton = document.getElementById('upload-btn');

window.addEventListener('DOMContentLoaded', async () => {
    channels = await window.electronAPI.getChannels();
    renderChannels();
    passwordEntries = await window.electronAPI.getPasswordEntries();
    renderPasswordEntries();
});

const addChannelModal = document.getElementById('add-channel-modal');
const newChannelNameInput = document.getElementById('new-channel-name');
const newChannelPasswordInput = document.getElementById('new-channel-password');
const createChannelBtn = document.getElementById('create-channel-btn');
const cancelChannelBtn = document.getElementById('cancel-channel-btn');

function showModal(modal) {
    modal.classList.remove('hidden');
    modal.classList.add('fade-in');
    const firstInput = modal.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
}

function hideModal(modal) {
    modal.classList.add('fade-out');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('fade-out');
    }, 300);
}

addChannelBtn.addEventListener('click', () => showModal(addChannelModal));

cancelChannelBtn.addEventListener('click', () => hideModal(addChannelModal));

menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuOptions.classList.toggle('visible');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.sidebar-menu')) {
        menuOptions.classList.remove('visible');
    }
    if (!e.target.closest('.search-bar-container')) {
        searchResultsContainer.classList.add('hidden');
    }
    if (!e.target.closest('.top-bar')) {
        pinnedMessagesDropdown.classList.add('hidden');
    }
});

createChannelBtn.addEventListener('click', () => {
    const channelName = newChannelNameInput.value;
    if (channelName) {
        const password = newChannelPasswordInput.value;
        channels[channelName] = { password: password, notes: [], isUnlocked: !password };
        window.electronAPI.saveChannels(channels);
        renderChannels();
        newChannelNameInput.value = '';
        newChannelPasswordInput.value = '';
        hideModal(addChannelModal);
    }
});

function updateChatBoxState() {
    const isLocked = activeChannel && channels[activeChannel].password && !channels[activeChannel].isUnlocked;
    noteInput.disabled = !activeChannel || isLocked;
    sendBtn.disabled = !activeChannel || isLocked;
    noteInput.placeholder = activeChannel ? (isLocked ? 'Unlock to send a message' : `Message #${activeChannel}`) : 'Select a channel';
}

function renderPasswordEntries() {
    const pmEntryList = document.querySelector('.pm-entry-list');
    pmEntryList.innerHTML = '';
    for (const entryName in passwordEntries) {
        const li = document.createElement('li');
        li.className = 'pm-entry-item';

        const entry = passwordEntries[entryName];
        if (entry.icon) {
            const icon = document.createElement('img');
            icon.src = entry.icon;
            icon.className = 'pm-entry-icon';
            li.appendChild(icon);
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = entryName;
        li.appendChild(nameSpan);

        if (entryName === activePasswordEntry) {
            li.classList.add('active');
        }
        li.addEventListener('click', () => {
            activePasswordEntry = entryName;
            renderPasswordEntries();
            renderPasswordEntryDetails();
        });
        pmEntryList.appendChild(li);
    }
}

function renderPasswordEntryDetails() {
    const pmEntryDetails = document.querySelector('.pm-entry-details');
    const topBar = document.querySelector('.pm-top-bar');
    topBar.innerHTML = '<button id="new-password-btn">+ New</button>'; // Reset top bar
    document.getElementById('new-password-btn').addEventListener('click', renderNewPasswordForm);

    pmEntryDetails.innerHTML = '';
    if (activePasswordEntry && passwordEntries[activePasswordEntry]) {
        const entry = passwordEntries[activePasswordEntry];

        // Add Edit and Delete buttons
        const editBtn = document.createElement('button');
        editBtn.id = 'edit-entry-btn';
        editBtn.textContent = 'Edit';
        editBtn.classList.add('animated-btn');

        const deleteBtn = document.createElement('button');
        deleteBtn.id = 'delete-entry-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('animated-btn');

        topBar.appendChild(editBtn);
        topBar.appendChild(deleteBtn);

        setTimeout(() => {
            editBtn.classList.add('visible');
            deleteBtn.classList.add('visible');
        }, 10);


        deleteBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete "${activePasswordEntry}"?`)) {
                delete passwordEntries[activePasswordEntry];
                window.electronAPI.savePasswordEntries(passwordEntries);
                activePasswordEntry = null;
                renderPasswordEntries();
                pmEntryDetails.innerHTML = '';
                topBar.innerHTML = '<button id="new-password-btn">+ New</button>';
                 document.getElementById('new-password-btn').addEventListener('click', renderNewPasswordForm);
            }
        });

        editBtn.addEventListener('click', () => renderEditPasswordForm(entry));


        pmEntryDetails.innerHTML = `
            <h2>${activePasswordEntry}</h2>
            <div class="pm-detail-row">
                <label>Username</label>
                <div class="pm-detail-input-container">
                    <div class="pm-detail-value">${entry.username}</div>
                    <button class="copy-btn" data-value="${entry.username}">📋</button>
                </div>
            </div>
            <div class="pm-detail-row">
                <label>Email</label>
                <div class="pm-detail-input-container">
                    <div class="pm-detail-value">${entry.email}</div>
                    <button class="copy-btn" data-value="${entry.email}">📋</button>
                </div>
            </div>
            <div class="pm-detail-row">
                <label>Password</label>
                <div class="pm-detail-input-container">
                    <div class="pm-detail-value">••••••••</div>
                    <button class="copy-btn" data-value="${entry.password}">📋</button>
                </div>
            </div>
            <div class="pm-detail-row">
                <label>Website</label>
                <div class="pm-detail-input-container">
                    <div class="pm-detail-value">${entry.website}</div>
                    <button class="copy-btn" data-value="${entry.website}">📋</button>
                </div>
            </div>
            <div class="pm-detail-row">
                <label>Notes</label>
                <div class="pm-detail-value" style="min-height: 80px; white-space: pre-wrap;">${entry.notes}</div>
            </div>
        `;
        // Add event listeners for copy buttons
        pmEntryDetails.querySelectorAll('.copy-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                navigator.clipboard.writeText(e.currentTarget.dataset.value);
                // Optional: show a "copied" message
            });
        });
    }
}

function renderNewPasswordForm() {
    activePasswordEntry = null;
    renderPasswordEntries(); // Deselect any active entry
    const topBar = document.querySelector('.pm-top-bar');
    topBar.innerHTML = '<button id="new-password-btn">+ New</button>';
    document.getElementById('new-password-btn').addEventListener('click', renderNewPasswordForm);

    let newIconPath = null; // Variable to hold the selected icon path
    const pmEntryDetails = document.querySelector('.pm-entry-details');
    pmEntryDetails.innerHTML = `
        <h2>New Entry</h2>
        <div class="pm-detail-row">
            <label>Icon</label>
            <div id="icon-upload-area" class="icon-upload-area">
                <div class="icon-upload-placeholder">+</div>
                <img id="icon-preview" class="hidden" src="">
            </div>
        </div>
        <div class="pm-detail-row">
            <label>Name</label>
            <input type="text" id="new-entry-name" placeholder="e.g., Google">
        </div>
        <div class="pm-detail-row">
            <label>Username</label>
            <input type="text" id="new-entry-username">
        </div>
        <div class="pm-detail-row">
            <label>Email</label>
            <input type="email" id="new-entry-email">
        </div>
        <div class="pm-detail-row">
            <label>Password</label>
            <div class="password-strength-container">
                <input type="password" id="new-entry-password" style="width: calc(100% - 30px);">
                <div class="password-strength-indicator"></div>
            </div>
        </div>
        <div class="pm-detail-row">
            <label>Website</label>
            <input type="text" id="new-entry-website">
        </div>
        <div class="pm-detail-row">
            <label>Notes</label>
            <textarea id="new-entry-notes"></textarea>
        </div>
        <button id="save-new-entry-btn" class="sleek-btn">Save</button>
    `;

    const passwordInput = document.getElementById('new-entry-password');
    const strengthIndicator = document.querySelector('.password-strength-indicator');

    passwordInput.addEventListener('input', () => {
        const strength = checkPasswordStrength(passwordInput.value);
        strengthIndicator.style.backgroundColor = strength.color;
    });

    document.getElementById('icon-upload-area').addEventListener('click', async () => {
        const filePath = await window.electronAPI.openFileDialog();
        if (filePath) {
            newIconPath = filePath;
            const iconPreview = document.getElementById('icon-preview');
            const iconPlaceholder = document.querySelector('.icon-upload-placeholder');
            iconPreview.src = filePath;
            iconPreview.classList.remove('hidden');
            iconPlaceholder.classList.add('hidden');
        }
    });

    document.getElementById('save-new-entry-btn').addEventListener('click', () => {
        const name = document.getElementById('new-entry-name').value;
        if (!name) {
            showCustomAlert('Please provide a name for the entry.');
            return;
        }
        if (passwordEntries[name]) {
            showCustomAlert('An entry with this name already exists.');
            return;
        }

        passwordEntries[name] = {
            username: document.getElementById('new-entry-username').value,
            email: document.getElementById('new-entry-email').value,
            password: document.getElementById('new-entry-password').value,
            website: document.getElementById('new-entry-website').value,
            notes: document.getElementById('new-entry-notes').value,
            icon: newIconPath
        };
        window.electronAPI.savePasswordEntries(passwordEntries);
        activePasswordEntry = name;
        renderPasswordEntries();
        renderPasswordEntryDetails();
    });
}

function renderEditPasswordForm(entry) {
    const originalName = activePasswordEntry;
    const pmEntryDetails = document.querySelector('.pm-entry-details');
    let updatedIconPath = entry.icon;

    pmEntryDetails.innerHTML = `
        <h2>Edit Entry</h2>
         <div class="pm-detail-row">
            <label>Icon</label>
            <div id="icon-upload-area" class="icon-upload-area">
                <div class="icon-upload-placeholder ${entry.icon ? 'hidden' : ''}">+</div>
                <img id="icon-preview" class="${entry.icon ? '' : 'hidden'}" src="${entry.icon || ''}">
            </div>
        </div>
        <div class="pm-detail-row">
            <label>Name</label>
            <input type="text" id="edit-entry-name" value="${originalName}">
        </div>
        <div class="pm-detail-row">
            <label>Username</label>
            <input type="text" id="edit-entry-username" value="${entry.username}">
        </div>
        <div class="pm-detail-row">
            <label>Email</label>
            <input type="email" id="edit-entry-email" value="${entry.email}">
        </div>
        <div class="pm-detail-row">
            <label>Password</label>
             <div class="password-strength-container">
                <input type="password" id="edit-entry-password" value="${entry.password}" style="width: calc(100% - 30px);">
                <div class="password-strength-indicator"></div>
            </div>
        </div>
        <div class="pm-detail-row">
            <label>Website</label>
            <input type="text" id="edit-entry-website" value="${entry.website}">
        </div>
        <div class="pm-detail-row">
            <label>Notes</label>
            <textarea id="edit-entry-notes">${entry.notes}</textarea>
        </div>
        <button id="save-changes-btn" class="sleek-btn">Save Changes</button>
    `;

    document.getElementById('icon-upload-area').addEventListener('click', async () => {
        const filePath = await window.electronAPI.openFileDialog();
        if (filePath) {
            updatedIconPath = filePath;
            const iconPreview = document.getElementById('icon-preview');
            const iconPlaceholder = document.querySelector('.icon-upload-placeholder');
            iconPreview.src = filePath;
            iconPreview.classList.remove('hidden');
            iconPlaceholder.classList.add('hidden');
        }
    });

    document.getElementById('save-changes-btn').addEventListener('click', () => {
        const newName = document.getElementById('edit-entry-name').value;
        
        const updatedEntry = {
            username: document.getElementById('edit-entry-username').value,
            email: document.getElementById('edit-entry-email').value,
            password: document.getElementById('edit-entry-password').value,
            website: document.getElementById('edit-entry-website').value,
            notes: document.getElementById('edit-entry-notes').value,
            icon: updatedIconPath
        };

        if (originalName !== newName) {
            delete passwordEntries[originalName];
        }
        
        passwordEntries[newName] = updatedEntry;

        window.electronAPI.savePasswordEntries(passwordEntries);
        activePasswordEntry = newName;
        renderPasswordEntries();
        renderPasswordEntryDetails();
    });
}

function checkPasswordStrength(password) {
    let score = 0;
    if (!password) return { score: 0, color: '#555' };

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 3) return { score, color: 'red' };
    if (score < 5) return { score, color: 'orange' };
    return { score, color: 'green' };
}


const newPasswordBtn = document.getElementById('new-password-btn');
newPasswordBtn.addEventListener('click', renderNewPasswordForm);

function renderChannels() {
    channelList.innerHTML = '';
    for (const channelName in channels) {
        const li = document.createElement('li');
        li.textContent = channelName;
        if (channels[channelName].password) {
            const lockIcon = document.createElement('span');
            lockIcon.className = 'lock-icon';
            lockIcon.textContent = '🔒';
            li.appendChild(lockIcon);
        }
        if (channelName === activeChannel) {
            li.classList.add('active');
        }
        li.addEventListener('click', () => {
            if (activeChannel && channels[activeChannel] && channels[activeChannel].password) {
                channels[activeChannel].isUnlocked = false;
            }
            activeChannel = channelName;
            renderChannels();
            const notesContent = document.getElementById('notes-content');
            if (channels[channelName].password && !channels[channelName].isUnlocked) {
                showModal(passwordModal);
                notesContainer.classList.add('hidden');
                notesContent.innerHTML = ''; // Clear notes when locked channel is clicked
            } else {
                hideModal(passwordModal);
                notesContainer.classList.remove('hidden');
                renderNotes();
            }
            updateChatBoxState();
        });
        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const contextMenu = document.createElement('div');
            contextMenu.className = 'context-menu';
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.left = `${e.clientX}px`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete Channel';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent the document click listener from firing immediately
                delete channels[channelName];
                if (activeChannel === channelName) {
                    activeChannel = null;
                    notesContainer.classList.add('hidden');
                    passwordModal.classList.add('hidden');
                }
                window.electronAPI.saveChannels(channels);
                renderChannels();
                if (document.body.contains(contextMenu)) {
                    document.body.removeChild(contextMenu);
                }
            });
            contextMenu.appendChild(deleteButton);
            document.body.appendChild(contextMenu);
            document.addEventListener('click', () => {
                if(document.body.contains(contextMenu)) {
                    document.body.removeChild(contextMenu);
                }
            }, { once: true });
        });
        channelList.appendChild(li);
    }
    if (Object.keys(channels).length > 0 && !activeChannel) {
        notesContainer.classList.add('hidden');
    }
}

passwordSubmit.addEventListener('click', () => {
    if (passwordInput.value === channels[activeChannel].password) {
        hideModal(passwordModal);
        notesContainer.classList.remove('hidden');
        channels[activeChannel].isUnlocked = true;
        renderNotes();
        passwordInput.value = '';
        updateChatBoxState();
    } else {
        showCustomAlert('Incorrect password');
        passwordInput.value = '';
    }
});

function showCustomAlert(message) {
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.textContent = message;
    document.body.appendChild(alertBox);
    setTimeout(() => {
        alertBox.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(alertBox);
        }, 500);
    }, 2000);
}

cancelPasswordBtn.addEventListener('click', () => {
    hideModal(passwordModal);
    const notesContent = document.getElementById('notes-content');
    notesContent.innerHTML = '';
    notesContainer.classList.add('hidden');
    activeChannel = null;
    renderChannels();
    updateChatBoxState();
});

const sendBtn = document.getElementById('send-btn');

function sendMessage() {
    if (activeChannel && noteInput.value.trim() !== '') {
        channels[activeChannel].notes.push({ type: 'text', content: noteInput.value, timestamp: new Date().toISOString() });
        window.electronAPI.saveChannels(channels);
        renderNotes();
        noteInput.value = '';
    }
}

noteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

searchInput.addEventListener('click', (e) => {
    e.stopPropagation();
});

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    if (activeChannel && searchTerm) {
        searchResultsContainer.classList.remove('hidden');
        const notes = channels[activeChannel].notes;
        const results = notes.filter(note => note.type === 'text' && note.content.toLowerCase().startsWith(searchTerm));
        renderSearchResults(results, searchTerm);
    } else {
        searchResultsContainer.classList.add('hidden');
    }
});

pinnedMessagesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeChannel) {
        renderPinnedMessages();
        pinnedMessagesDropdown.classList.toggle('hidden');
    }
});

sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sortBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const searchTerm = searchInput.value.toLowerCase();
        if (activeChannel && searchTerm) {
            const notes = channels[activeChannel].notes;
            let results = notes.filter(note => note.type === 'text' && note.content.toLowerCase().includes(searchTerm));
            const sortBy = btn.dataset.sort;
            if (sortBy === 'new') {
                results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            } else if (sortBy === 'old') {
                results.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            }
            renderSearchResults(results, searchTerm);
        }
    });
});

function renderPinnedMessages() {
    pinnedMessagesDropdown.innerHTML = '';
    if (activeChannel && channels[activeChannel]) {
        const pinnedNotes = channels[activeChannel].notes.filter(note => note.pinned);
        if (pinnedNotes.length > 0) {
            pinnedNotes.forEach(note => {
                const pinnedMessageElement = document.createElement('div');
                pinnedMessageElement.className = 'pinned-message';
                pinnedMessageElement.textContent = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
                pinnedMessageElement.addEventListener('click', () => {
                    const noteElement = document.querySelector(`[data-note-id="${note.timestamp}"]`);
                    if (noteElement) {
                        noteElement.scrollIntoView({ behavior: 'smooth' });
                        noteElement.classList.add('flash');
                        setTimeout(() => {
                            noteElement.classList.remove('flash');
                        }, 1000);
                    }
                    pinnedMessagesDropdown.classList.add('hidden');
                });
                pinnedMessagesDropdown.appendChild(pinnedMessageElement);
            });
        } else {
            const noPinnedMessages = document.createElement('div');
            noPinnedMessages.className = 'pinned-message';
            noPinnedMessages.textContent = 'No pinned messages in this channel.';
            pinnedMessagesDropdown.appendChild(noPinnedMessages);
        }
    }
}

function renderSearchResults(results, searchTerm) {
    searchResultsList.innerHTML = '';
    searchResultsCount.textContent = `${results.length} Results`;
    if (results.length > 0) {
        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result';

            const content = result.content.replace(new RegExp(searchTerm, 'gi'), (match) => `<span class="highlight">${match}</span>`);

            resultElement.innerHTML = `
                <div class="search-result-content">${content}</div>
            `;
            resultElement.addEventListener('click', () => {
                const noteElement = document.querySelector(`[data-note-id="${result.timestamp}"]`);
                if (noteElement) {
                    noteElement.scrollIntoView({ behavior: 'smooth' });
                    noteElement.classList.add('flash');
                    setTimeout(() => {
                        noteElement.classList.remove('flash');
                    }, 1000);
                }
                searchInput.value = '';
                searchResultsContainer.classList.add('hidden');
            });
            searchResultsList.appendChild(resultElement);
        });
    }
}

const importBtn = document.getElementById('import-btn');
const exportBtn = document.getElementById('export-btn');

uploadButton.addEventListener('click', async () => {
    const filePath = await window.electronAPI.openFileDialog();
    if (filePath) {
        channels[activeChannel].notes.push({ type: 'image', content: filePath, timestamp: new Date().toISOString() });
        window.electronAPI.saveChannels(channels);
        renderNotes();
    }
});

importBtn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.openFileDialog();
    if (filePath) {
        const fileContent = await window.electronAPI.readFile(filePath);
        try {
            const importedChannels = JSON.parse(fileContent);
            // A simple validation to check if the imported data is in the correct format
            if (typeof importedChannels === 'object' && importedChannels !== null) {
                channels = importedChannels;
                window.electronAPI.saveChannels(channels);
                activeChannel = null;
                renderChannels();
                notesContainer.classList.add('hidden');
                passwordModal.classList.add('hidden');
                updateChatBoxState();
            } else {
                showCustomAlert('Invalid file format. Please select a valid channels backup file.');
            }
        } catch (error) {
            showCustomAlert('Failed to parse JSON file. Please make sure it is a valid JSON file.');
            console.error(error);
        }
    }
});

exportBtn.addEventListener('click', async () => {
    const channelsToExport = await window.electronAPI.getChannels();
    const data = JSON.stringify(channelsToExport, null, 2);
    await window.electronAPI.saveFileDialog(data);
});

const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const closeImageBtn = document.querySelector('.close-image-btn');
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;

closeImageBtn.addEventListener('click', () => hideModal(imageModal));

imageModal.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    if (e.deltaY < 0) {
        zoomLevel += zoomSpeed;
    } else {
        zoomLevel = Math.max(0.1, zoomLevel - zoomSpeed);
    }
    updateImageTransform();
});

modalImage.addEventListener('dragstart', (e) => e.preventDefault());

modalImage.addEventListener('mousedown', (e) => {
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    modalImage.style.cursor = 'grabbing';
});

const stopPanning = () => {
    if (isPanning) {
        isPanning = false;
        modalImage.style.cursor = 'grab';
        panX = 0;
        panY = 0;
        updateImageTransform();
    }
};

window.addEventListener('mouseup', stopPanning);
window.addEventListener('mouseleave', stopPanning);

window.addEventListener('mousemove', (e) => {
    if (isPanning) {
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        updateImageTransform(false); // Don't use transition during drag
    }
});

function updateImageTransform(useTransition = true) {
    modalImage.style.transition = useTransition ? 'transform 0.3s ease-out' : 'none';
    modalImage.style.transform = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
}

const videoModal = document.getElementById('video-modal');
const modalVideo = document.getElementById('modal-video');
const closeVideoBtn = document.querySelector('.close-video-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const seekBar = document.getElementById('seek-bar');
const volumeBar = document.getElementById('volume-bar');
const fullscreenBtn = document.getElementById('fullscreen-btn');

closeVideoBtn.addEventListener('click', () => {
    hideModal(videoModal);
    modalVideo.pause();
});

playPauseBtn.addEventListener('click', () => {
    if (modalVideo.paused) {
        modalVideo.play();
        playPauseBtn.textContent = 'Pause';
    } else {
        modalVideo.pause();
        playPauseBtn.textContent = 'Play';
    }
});

modalVideo.addEventListener('timeupdate', () => {
    const value = (100 / modalVideo.duration) * modalVideo.currentTime;
    seekBar.value = value;
});

seekBar.addEventListener('input', () => {
    const time = (modalVideo.duration / 100) * seekBar.value;
    modalVideo.currentTime = time;
});

volumeBar.addEventListener('input', () => {
    modalVideo.volume = volumeBar.value;
});

fullscreenBtn.addEventListener('click', () => {
    if (modalVideo.requestFullscreen) {
        modalVideo.requestFullscreen();
    } else if (modalVideo.webkitRequestFullscreen) { /* Safari */
        modalVideo.webkitRequestFullscreen();
    } else if (modalVideo.msRequestFullscreen) { /* IE11 */
        modalVideo.msRequestFullscreen();
    }
});

function renderNotes(scrollToBottom = true) {
    const notesContent = document.getElementById('notes-content');
    const scrollPosition = notesContent.scrollTop;
    notesContent.innerHTML = '';
    let lastDate = null;
    if (activeChannel && channels[activeChannel]) {
        const sortedNotes = channels[activeChannel].notes.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        sortedNotes.forEach(note => {
            const noteDate = new Date(note.timestamp);
            if (isNaN(noteDate)) {
                return;
            }
            const noteDateString = noteDate.toLocaleDateString();
            if (noteDateString !== lastDate) {
                const dateSeparator = document.createElement('div');
                dateSeparator.className = 'date-separator';
                dateSeparator.textContent = noteDateString;
                notesContent.appendChild(dateSeparator);
                lastDate = noteDateString;
            }

            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            noteElement.dataset.noteId = note.timestamp;

            noteElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();

                const existingMenu = document.querySelector('.context-menu');
                if (existingMenu) {
                    existingMenu.remove();
                }

                const contextMenu = document.createElement('div');
                contextMenu.className = 'context-menu';
                contextMenu.style.top = `${e.clientY}px`;
                contextMenu.style.left = `${e.clientX}px`;

                const pinButton = document.createElement('button');
                pinButton.textContent = note.pinned ? 'Unpin' : 'Pin';
                pinButton.addEventListener('click', () => {
                    note.pinned = !note.pinned;
                    window.electronAPI.saveChannels(channels);
                    renderNotes(false);
                    if (document.body.contains(contextMenu)) {
                        document.body.removeChild(contextMenu);
                    }
                });

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => {
                    channels[activeChannel].notes = channels[activeChannel].notes.filter(n => n.timestamp !== note.timestamp);
                    window.electronAPI.saveChannels(channels);
                    renderNotes();
                    document.body.removeChild(contextMenu);
                });

                const replyButton = document.createElement('button');
                replyButton.textContent = 'Reply';
                replyButton.addEventListener('click', () => {
                    const replyContent = prompt('Enter your reply:');
                    if (replyContent) {
                        channels[activeChannel].notes.push({
                            type: 'reply',
                            content: replyContent,
                            replyTo: note.timestamp,
                            timestamp: new Date().toISOString()
                        });
                        window.electronAPI.saveChannels(channels);
                        renderNotes();
                    }
                    document.body.removeChild(contextMenu);
                });

                contextMenu.appendChild(pinButton);
                contextMenu.appendChild(deleteButton);
                contextMenu.appendChild(replyButton);

                document.body.appendChild(contextMenu);
                document.addEventListener('click', () => {
                    if(document.body.contains(contextMenu)) {
                        document.body.removeChild(contextMenu);
                    }
                }, { once: true });
            });

            const timestamp = document.createElement('span');
            timestamp.className = 'timestamp';
            timestamp.textContent = noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            noteElement.appendChild(timestamp);

            if (note.type === 'text') {
                const content = document.createElement('span');
                content.textContent = note.content;
                noteElement.appendChild(content);
            } else if (note.type === 'image') {
                const img = document.createElement('img');
                img.src = note.content;
                img.addEventListener('click', () => {
                    imageModal.classList.remove('hidden');
                    modalImage.src = img.src;
                    zoomLevel = 1;
                    panX = 0;
                    panY = 0;
                    updateImageTransform();
                });
                noteElement.appendChild(img);
            } else if (note.type === 'video') {
                const video = document.createElement('video');
                video.src = note.content;
                video.addEventListener('click', () => {
                    videoModal.classList.remove('hidden');
                    modalVideo.src = video.src;
                });
                noteElement.appendChild(video);
            } else if (note.type === 'reply') {
                const replyContent = document.createElement('div');
                replyContent.className = 'reply-content';

                const originalMessage = channels[activeChannel].notes.find(n => n.timestamp === note.replyTo);
                if (originalMessage) {
                    const originalMessageElement = document.createElement('div');
                    originalMessageElement.className = 'original-message';
                    originalMessageElement.textContent = `Replying to: ${originalMessage.content.substring(0, 20)}...`;
                    originalMessageElement.addEventListener('click', () => {
                        const originalNoteElement = document.querySelector(`[data-note-id="${note.replyTo}"]`);
                        if (originalNoteElement) {
                            originalNoteElement.scrollIntoView({ behavior: 'smooth' });
                        }
                    });
                    replyContent.appendChild(originalMessageElement);
                }

                const replyText = document.createElement('span');
                replyText.textContent = note.content;
                replyContent.appendChild(replyText);
                noteElement.appendChild(replyContent);
            }

            if (!note.content && note.type !== 'reply') {
                const content = document.createElement('span');
                content.innerHTML = '&nbsp;';
                noteElement.appendChild(content);
            }
            notesContent.appendChild(noteElement);
        });
        if (scrollToBottom) {
            notesContent.scrollTop = notesContent.scrollHeight;
        } else {
            notesContent.scrollTop = scrollPosition;
        }
    }
}
