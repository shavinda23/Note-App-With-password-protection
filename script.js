document.addEventListener('DOMContentLoaded', function() {
    
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const passwordSubmit = document.getElementById('passwordSubmit');
    const passwordError = document.getElementById('passwordError');
    const appContainer = document.getElementById('appContainer');
    
    const newNoteBtn = document.getElementById('newNoteBtn');
    const emptyNewNoteBtn = document.getElementById('emptyNewNoteBtn');
    const notesList = document.getElementById('notesList');
    const noteCount = document.getElementById('noteCount');
    
    const emptyState = document.getElementById('emptyState');
    const editorContainer = document.getElementById('editorContainer');
    const noteTitle = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const deleteNoteBtn = document.getElementById('deleteNoteBtn');
    const exportNoteBtn = document.getElementById('exportNoteBtn');
    const lastSaved = document.getElementById('lastSaved');
    const charCount = document.getElementById('charCount');
    
    const searchBtn = document.getElementById('searchBtn');
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    
    const themeToggle = document.getElementById('themeToggle');
    const exportModal = document.getElementById('exportModal');
    const exportTxtBtn = document.getElementById('exportTxtBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const closeExportModal = document.getElementById('closeExportModal');
    

    let notes = JSON.parse(localStorage.getItem('shavinda-notes')) || [];
    let currentNoteId = null;
    let isSearching = false;
    let searchResults = [];
    let saveTimeout = null;
    

    const PASSWORD = "shavinda";
    
    passwordSubmit.addEventListener('click', () => {
        if (passwordInput.value === PASSWORD) {
            passwordModal.classList.add('hidden');
            appContainer.classList.remove('hidden');
            loadNotes();
        } else {
            passwordError.textContent = "Incorrect password. Please try again.";
            passwordInput.value = '';
        }
    });
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            passwordSubmit.click();
        }
    });
    

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('shavinda-theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('shavinda-theme', 'dark');
        }
    });
    

    const savedTheme = localStorage.getItem('shavinda-theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    

    function loadNotes() {
        notesList.innerHTML = '';
        
        const notesToDisplay = isSearching ? searchResults : notes;
        
        if (notesToDisplay.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = isSearching ? 'No matching notes found' : 'No notes yet. Create one!';
            notesList.appendChild(emptyMessage);
        } else {
            notesToDisplay.forEach(note => {
                const noteItem = createNoteElement(note);
                notesList.appendChild(noteItem);
            });
        }
        
        noteCount.textContent = `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`;
    }
    
    function createNoteElement(note) {
        const noteItem = document.createElement('div');
        noteItem.className = `note-item ${currentNoteId === note.id ? 'active' : ''}`;
        noteItem.dataset.id = note.id;
        
        const notePreview = note.content.replace(/<[^>]*>/g, '').substring(0, 100);
        const date = new Date(note.updatedAt).toLocaleString();
        
        noteItem.innerHTML = `
            <h4>${note.title || 'Untitled Note'}</h4>
            <p>${notePreview || 'No content'}</p>
            <div class="note-date">${date}</div>
        `;
        
        noteItem.addEventListener('click', () => openNote(note.id));
        
        return noteItem;
    }
    
    function openNote(id) {
        const note = notes.find(note => note.id === id);
        if (!note) return;
        
        currentNoteId = id;
        emptyState.classList.add('hidden');
        editorContainer.classList.remove('hidden');
        
        noteTitle.value = note.title;
        noteContent.innerHTML = note.content;
        
        updateLastSaved(note.updatedAt);
        updateCharCount();
        

        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.id === id) {
                item.classList.add('active');
            }
        });
    }
    
    function createNewNote() {
        const newNote = {
            id: Date.now().toString(),
            title: '',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        notes.unshift(newNote);
        saveNotes();
        
        currentNoteId = newNote.id;
        emptyState.classList.add('hidden');
        editorContainer.classList.remove('hidden');
        
        noteTitle.value = '';
        noteContent.innerHTML = '';
        
        updateLastSaved(newNote.updatedAt);
        updateCharCount();
        
        loadNotes();
        noteTitle.focus();
    }
    
    function saveCurrentNote() {
        if (!currentNoteId) return;
        
        const noteIndex = notes.findIndex(note => note.id === currentNoteId);
        if (noteIndex === -1) return;
        
        const now = new Date().toISOString();
        
        notes[noteIndex] = {
            ...notes[noteIndex],
            title: noteTitle.value,
            content: noteContent.innerHTML,
            updatedAt: now
        };
        
        saveNotes();
        updateLastSaved(now);
        loadNotes();
    }
    
    function deleteCurrentNote() {
        if (!currentNoteId) return;
        
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(note => note.id !== currentNoteId);
            saveNotes();
            
            currentNoteId = null;
            editorContainer.classList.add('hidden');
            emptyState.classList.remove('hidden');
            
            loadNotes();
        }
    }
    
    function saveNotes() {
        localStorage.setItem('shavinda-notes', JSON.stringify(notes));
    }
    
    function updateLastSaved(dateString) {
        const date = new Date(dateString);
        lastSaved.textContent = `Last saved: ${date.toLocaleString()}`;
    }
    
    function updateCharCount() {
        const text = noteContent.innerText || '';
        charCount.textContent = `${text.length} characters`;
    }
    

    document.querySelectorAll('.editor-toolbar button').forEach(button => {
        button.addEventListener('click', () => {
            const command = button.dataset.command;
            
            if (command === 'createLink') {
                const url = prompt('Enter the URL:');
                if (url) document.execCommand(command, false, url);
            } else {
                document.execCommand(command, false, null);
            }
            
            noteContent.focus();
        });
    });
    

    searchBtn.addEventListener('click', () => {
        searchContainer.classList.remove('hidden');
        searchInput.focus();
    });
    
    closeSearchBtn.addEventListener('click', () => {
        searchContainer.classList.add('hidden');
        searchInput.value = '';
        isSearching = false;
        loadNotes();
    });
    
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        
        if (query.trim() === '') {
            isSearching = false;
            loadNotes();
            return;
        }
        
        isSearching = true;
        searchResults = notes.filter(note => {
            return (
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query)
            );
        });
        
        loadNotes();
    });
    

    exportNoteBtn.addEventListener('click', () => {
        exportModal.classList.remove('hidden');
    });
    
    closeExportModal.addEventListener('click', () => {
        exportModal.classList.add('hidden');
    });
    
    exportTxtBtn.addEventListener('click', () => {
        if (!currentNoteId) return;
        
        const note = notes.find(note => note.id === currentNoteId);
        if (!note) return;
        
        const content = `${note.title}\n\n${note.content.replace(/<[^>]*>/g, '\n')}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title || 'Untitled Note'}.txt`;
        a.click();
        
        URL.revokeObjectURL(url);
        exportModal.classList.add('hidden');
    });
    
    exportPdfBtn.addEventListener('click', () => {
        if (!currentNoteId) return;
        
        const note = notes.find(note => note.id === currentNoteId);
        if (!note) return;
        
        alert('PDF export would be implemented with a library like jsPDF or browser print functionality.');
        exportModal.classList.add('hidden');
    });
    

    newNoteBtn.addEventListener('click', createNewNote);
    emptyNewNoteBtn.addEventListener('click', createNewNote);
    
    saveNoteBtn.addEventListener('click', saveCurrentNote);
    deleteNoteBtn.addEventListener('click', deleteCurrentNote);
    
    noteTitle.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveCurrentNote, 1000);
    });
    
    noteContent.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveCurrentNote();
            updateCharCount();
        }, 1000);
    });
    

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveCurrentNote();
        }
        
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            createNewNote();
        }
    });
    

    if (notes.length > 0) {
        openNote(notes[0].id);
    }
});