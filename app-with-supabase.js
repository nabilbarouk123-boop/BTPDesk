// ===== KADER CM - Application Complète avec Supabase =====

// ===== SUPABASE CONFIGURATION =====
const SUPABASE_URL = localStorage.getItem('SUPABASE_URL') || '';
const SUPABASE_KEY = localStorage.getItem('SUPABASE_KEY') || '';

let supabase = null;

// Initialize Supabase if credentials exist
if (SUPABASE_URL && SUPABASE_KEY) {
    const { createClient } = window.supabase;
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ===== STATE =====
let state = {
    currentUser: null,
    data: {
        employes: [],
        habilitations: [],
        engins: [],
        sousTraitants: [],
        badges: []
    },
    currentEditId: null,
    currentModule: null,
    isOnline: !!supabase
};

// ===== FALLBACK DATA (si pas de Supabase) =====
const defaultData = {
    employes: [
        { id: 1, nom: 'Chraibi', prenom: 'Nabil', cin: 'AB123456', poste: 'Document Controller', telephone: '+212601234567', dateEmbauche: '2023-01-15', statut: 'Actif', notes: 'Chef document controller', cinFile: null, anthropometricFile: null, photosFiles: [], badgeFile: null, jpassFile: null },
        { id: 2, nom: 'Alaoui', prenom: 'Karim', cin: 'AB234567', poste: 'Soudeur', telephone: '+212602345678', dateEmbauche: '2023-02-20', statut: 'Actif', notes: '', cinFile: null, anthropometricFile: null, photosFiles: [], badgeFile: null, jpassFile: null },
        { id: 3, nom: 'Bennani', prenom: 'Mohamed', cin: 'AB345678', poste: 'Monteur', telephone: '+212603456789', dateEmbauche: '2023-03-10', statut: 'Actif', notes: '', cinFile: null, anthropometricFile: null, photosFiles: [], badgeFile: null, jpassFile: null }
    ],
    habilitations: [
        { id: 1, employeId: 1, employe: 'Chraibi Nabil', type: 'Travail en hauteur', dateDelivrance: '2024-01-15', dateExpiration: '2026-01-15', organisme: 'CNFEC', numeroCert: 'HAB001', statut: 'Valide' },
        { id: 2, employeId: 2, employe: 'Alaoui Karim', type: 'Permis feu', dateDelivrance: '2023-06-20', dateExpiration: '2025-06-20', organisme: 'CNFEC', numeroCert: 'FEU001', statut: 'Valide' },
        { id: 3, employeId: 3, employe: 'Bennani Mohamed', type: 'CACES', dateDelivrance: '2023-03-10', dateExpiration: '2025-03-10', organisme: 'GRETA', numeroCert: 'CACES001', statut: 'Valide' }
    ],
    engins: [
        { id: 1, designation: 'Grue Mobile 25T', type: 'Grue mobile', numeroSerie: 'GM001', marque: 'Tadano', annee: 2019, operateurNom: 'Alaoui Karim', etat: 'Opérationnel', dateControle: '2024-03-15', dateProchain: '2025-03-15', observations: '' },
        { id: 2, designation: 'Nacelle Télescopique', type: 'Nacelle', numeroSerie: 'NT001', marque: 'JCB', annee: 2020, operateurNom: 'Bennani Mohamed', etat: 'Opérationnel', dateControle: '2024-02-10', dateProchain: '2025-02-10', observations: '' }
    ],
    sousTraitants: [
        { id: 1, nomEntreprise: 'MetalSoud', specialite: 'Soudure acier', responsable: 'Ahmed El Fassi', telephone: '+212670123456', email: 'contact@metalsoud.ma', effectif: 8, dateDebut: '2024-01-01', dateFin: '2024-12-31', statut: 'Actif', notes: '' }
    ],
    badges: [
        { id: 1, employeNom: 'Chraibi Nabil', numeroBadge: 'KCM001', typePorteur: 'Employé', zoneAutorisee: 'Bureau', dateValidite: '2025-12-31', dateEmission: '2024-01-01', statut: 'Actif' },
        { id: 2, employeNom: 'Alaoui Karim', numeroBadge: 'KCM002', typePorteur: 'Employé', zoneAutorisee: 'Soudure', dateValidite: '2025-12-31', dateEmission: '2024-01-01', statut: 'Actif' }
    ]
};

// Demo users
const demoUsers = {
    'admin@kader.com': { password: 'admin123', role: 'admin', nom: 'Admin', prenom: 'Kader CM' },
    'rh@kader.com': { password: 'rh123', role: 'rh', nom: 'RH', prenom: 'Kader' },
    'employe@kader.com': { password: 'emp123', role: 'employe', nom: 'Employé', prenom: 'Kader' },
    'hse@kader.com': { password: 'hse123', role: 'hse', nom: 'HSE', prenom: 'Kader' }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 KADER CM - Initialisation...');
    console.log('Mode Online:', state.isOnline ? '✅ Supabase' : '❌ Local');

    // Charger les données de localStorage ou Supabase
    if (state.isOnline) {
        await loadDataFromSupabase();
    } else {
        state.data = JSON.parse(localStorage.getItem('kaderCMData')) || defaultData;
    }

    // Vérifier si user est connecté
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        initLogin();
    }

    // Setup modal close
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');
    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
});

// ===== LOAD DATA FROM SUPABASE =====
async function loadDataFromSupabase() {
    if (!supabase) {
        console.warn('Supabase non connecté, utilisation données locales');
        state.data = JSON.parse(localStorage.getItem('kaderCMData')) || defaultData;
        return;
    }

    try {
        // Load employes
        const { data: employes } = await supabase.from('employes').select('*');
        state.data.employes = employes || [];

        // Load habilitations
        const { data: habilitations } = await supabase.from('habilitations').select('*');
        state.data.habilitations = habilitations || [];

        // Load engins
        const { data: engins } = await supabase.from('engins').select('*');
        state.data.engins = engins || [];

        // Load sous_traitants
        const { data: sousTraitants } = await supabase.from('sous_traitants').select('*');
        state.data.sousTraitants = sousTraitants || [];

        // Load badges
        const { data: badges } = await supabase.from('badges').select('*');
        state.data.badges = badges || [];

        console.log('✅ Données chargées depuis Supabase');
    } catch (error) {
        console.error('Erreur Supabase:', error);
        // Fallback à localStorage
        state.data = JSON.parse(localStorage.getItem('kaderCMData')) || defaultData;
    }
}

// ===== SAVE DATA =====
function saveData() {
    if (state.isOnline) {
        saveDataToSupabase();
    } else {
        localStorage.setItem('kaderCMData', JSON.stringify(state.data));
    }
}

async function saveDataToSupabase() {
    if (!supabase) return;
    // Implementation spécifique à chaque table
    // Sera appelée depuis les fonctions d'insertion/modification
}

// ===== LOGIN SYSTEM =====
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;

        if (state.isOnline && supabase) {
            // Login avec Supabase
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                if (error) throw error;
                
                // Charger le profil
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                state.currentUser = {
                    id: data.user.id,
                    email: data.user.email,
                    ...profile
                };
                localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
                showMainApp();
            } catch (error) {
                alert('❌ Erreur: ' + error.message);
            }
        } else {
            // Login local (demo)
            if (demoUsers[email] && demoUsers[email].password === password) {
                state.currentUser = { email, ...demoUsers[email] };
                localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
                showMainApp();
            } else {
                alert('❌ Email ou mot de passe incorrect!');
            }
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', logout);
}

function logout() {
    state.currentUser = null;
    localStorage.removeItem('currentUser');
    if (state.isOnline && supabase) {
        supabase.auth.signOut();
    }
    location.reload();
}

function showMainApp() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('mainApp').classList.add('active');
    updateUserInfo();
    initNavigation();
    renderDashboard();
}

function updateUserInfo() {
    const userInfo = document.getElementById('userInfo');
    if (state.currentUser) {
        userInfo.textContent = `${state.currentUser.prenom} ${state.currentUser.nom} (${state.currentUser.role})`;
    }
}

// ===== NAVIGATION =====
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const screen = item.dataset.screen;
            switchPage(screen);
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchPage(page) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    
    const target = document.getElementById(page);
    if (target) {
        target.classList.add('active');
        document.getElementById('pageTitle').textContent = getPageTitle(page);
        
        if (page === 'dashboard') renderDashboard();
        else if (page === 'employes') renderEmployes();
        else if (page === 'habilitations') renderHabilitations();
        else if (page === 'engins') renderEngins();
        else if (page === 'sous-traitants') renderSousTraitants();
        else if (page === 'acces') renderAcces();
    }
}

function getPageTitle(page) {
    const titles = {
        dashboard: 'Tableau de bord',
        employes: 'Gestion des Employés',
        habilitations: 'Habilitations & Certifications',
        engins: 'Engins & Machines',
        'sous-traitants': 'Sous-traitants',
        acces: 'Accès & Badges',
        export: 'Export Données'
    };
    return titles[page] || 'Page';
}

// ===== DASHBOARD =====
function renderDashboard() {
    updateStats();
    renderAlerts();
    renderRecentEmployes();
}

function updateStats() {
    document.getElementById('employeCount').textContent = state.data.employes.length;
    document.getElementById('habCount').textContent = state.data.habilitations.length;
    document.getElementById('enginCount').textContent = state.data.engins.length;
    
    const expiredHabs = state.data.habilitations.filter(h => {
        const expDate = new Date(h.date_expiration || h.dateExpiration);
        return expDate < new Date();
    }).length;
    document.getElementById('alertCount').textContent = expiredHabs;
}

function renderAlerts() {
    const alertsList = document.getElementById('alertsList');
    const expiredHabs = state.data.habilitations.filter(h => {
        const expDate = new Date(h.date_expiration || h.dateExpiration);
        const today = new Date();
        const daysLeft = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        return daysLeft <= 30 && daysLeft >= 0;
    });

    if (expiredHabs.length === 0) {
        alertsList.innerHTML = '<p class="empty">Aucune alerte</p>';
        return;
    }

    alertsList.innerHTML = expiredHabs.map(hab => `
        <div class="alert-item warning">
            <strong>${hab.employe || hab.employe_nom || 'Employé'}</strong> - ${hab.type || hab.type_hab}
            <br><small>Expire le ${hab.date_expiration || hab.dateExpiration}</small>
        </div>
    `).join('');
}

function renderRecentEmployes() {
    const recentList = document.getElementById('recentEmployes');
    const recent = [...state.data.employes].slice(-3).reverse();

    if (recent.length === 0) {
        recentList.innerHTML = '<p class="empty">Aucun employé</p>';
        return;
    }

    recentList.innerHTML = recent.map(emp => `
        <div class="recent-item">
            ${emp.prenom} ${emp.nom} - <strong>${emp.poste}</strong>
        </div>
    `).join('');
}

// ===== EMPLOYES =====
function renderEmployes() {
    const searchInput = document.getElementById('searchEmploye');
    const filterSelect = document.getElementById('filterPoste');
    const tbody = document.getElementById('employesList');

    function updateTable() {
        const search = searchInput.value.toLowerCase();
        const filter = filterSelect.value;

        let filtered = state.data.employes.filter(emp => {
            const matchSearch = emp.nom.toLowerCase().includes(search) || 
                              emp.prenom.toLowerCase().includes(search) ||
                              emp.cin.includes(search);
            const matchFilter = !filter || emp.poste === filter;
            return matchSearch && matchFilter;
        });

        tbody.innerHTML = filtered.length === 0 ? 
            '<tr><td colspan="8" class="empty">Aucun employé</td></tr>' :
            filtered.map(emp => `
                <tr>
                    <td>${emp.nom}</td>
                    <td>${emp.prenom}</td>
                    <td>${emp.cin}</td>
                    <td>${emp.poste}</td>
                    <td>${emp.telephone}</td>
                    <td class="doc-links">
                        ${emp.cinFile ? `<div><a href="${emp.cinFile.data}" download="${emp.cinFile.name}">CIN</a></div>` : ''}
                        ${emp.anthropometricFile ? `<div><a href="${emp.anthropometricFile.data}" download="${emp.anthropometricFile.name}">Fiche Anthropométrique</a></div>` : ''}
                        ${emp.photosFiles?.length ? emp.photosFiles.map(photo => '<div><a href="' + photo.data + '" download="' + photo.name + '">Photo</a></div>').join('') : ''}
                        ${emp.badgeFile ? `<div><a href="${emp.badgeFile.data}" download="${emp.badgeFile.name}">Badge</a></div>` : ''}
                        ${emp.jpassFile ? `<div><a href="${emp.jpassFile.data}" download="${emp.jpassFile.name}">J-Pass</a></div>` : ''}
                        ${!emp.cinFile && !emp.anthropometricFile && !emp.photosFiles?.length && !emp.badgeFile && !emp.jpassFile ? '<div>-</div>' : ''}
                    </td>
                    <td><span class="status-badge ${emp.statut === 'Actif' ? 'active' : 'inactive'}">${emp.statut}</span></td>
                    <td class="flex">
                        <button class="btn btn-edit" onclick="editEmploye(${emp.id})">✏️</button>
                        <button class="btn btn-danger btn-delete" onclick="deleteEmploye(${emp.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
    }

    searchInput.addEventListener('input', updateTable);
    filterSelect.addEventListener('change', updateTable);

    document.getElementById('addEmployeBtn').onclick = () => openEmployeForm();
    updateTable();
}

async function openEmployeForm(id = null) {
    state.currentEditId = id;
    state.currentModule = 'employes';
    
    const emp = id ? state.data.employes.find(e => e.id === id) : {};
    
    document.getElementById('modalTitle').textContent = id ? 'Modifier Employé' : 'Ajouter Employé';
    
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = `
        <div class="form-group">
            <label>Nom</label>
            <input type="text" id="nom" value="${emp.nom || ''}" required>
        </div>
        <div class="form-group">
            <label>Prénom</label>
            <input type="text" id="prenom" value="${emp.prenom || ''}" required>
        </div>
        <div class="form-group">
            <label>CIN</label>
            <input type="text" id="cin" value="${emp.cin || ''}" required>
        </div>
        <div class="form-group">
            <label>Poste</label>
            <select id="poste" required>
                <option value="">Sélectionner</option>
                <option value="Soudeur" ${emp.poste === 'Soudeur' ? 'selected' : ''}>Soudeur</option>
                <option value="Monteur" ${emp.poste === 'Monteur' ? 'selected' : ''}>Monteur</option>
                <option value="Opérateur" ${emp.poste === 'Opérateur' ? 'selected' : ''}>Opérateur</option>
                <option value="HSE" ${emp.poste === 'HSE' ? 'selected' : ''}>HSE</option>
                <option value="Chef" ${emp.poste === 'Chef' ? 'selected' : ''}>Chef d'équipe</option>
                <option value="Document Controller" ${emp.poste === 'Document Controller' ? 'selected' : ''}>Document Controller</option>
            </select>
        </div>
        <div class="form-group">
            <label>Téléphone</label>
            <input type="tel" id="telephone" value="${emp.telephone || ''}">
        </div>
        <div class="form-group">
            <label>Date Embauche</label>
            <input type="date" id="dateEmbauche" value="${emp.dateEmbauche || emp.date_embauche || ''}">
        </div>
        <div class="form-group">
            <label>Statut</label>
            <select id="statut">
                <option value="Actif" ${emp.statut === 'Actif' ? 'selected' : ''}>Actif</option>
                <option value="Inactif" ${emp.statut === 'Inactif' ? 'selected' : ''}>Inactif</option>
            </select>
        </div>
        <div class="form-group">
            <label>Notes</label>
            <textarea id="notes">${emp.notes || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Fichier CIN</label>
            <input type="file" id="cinFile" accept=".pdf,.jpg,.png,.jpeg">
            ${emp.cinFile ? `<small class="file-note">Actuel: <a class="doc-link" href="${emp.cinFile.data}" download="${emp.cinFile.name}">${emp.cinFile.name}</a></small>` : ''}
        </div>
        <div class="form-group">
            <label>Fiche Anthropométrique</label>
            <input type="file" id="anthropometricFile" accept=".pdf,.jpg,.png,.jpeg">
            ${emp.anthropometricFile ? `<small class="file-note">Actuel: <a class="doc-link" href="${emp.anthropometricFile.data}" download="${emp.anthropometricFile.name}">${emp.anthropometricFile.name}</a></small>` : ''}
        </div>
        <div class="form-group">
            <label>Photos</label>
            <input type="file" id="photosFile" accept=".jpg,.png,.jpeg" multiple>
            ${emp.photosFiles?.length ? '<small class="file-note">Actuelles: ' + emp.photosFiles.map(photo => '<a class="doc-link" href="' + photo.data + '" download="' + photo.name + '">' + photo.name + '</a>').join(', ') + '</small>' : ''}
        </div>
        <div class="form-group">
            <label>Badge</label>
            <input type="file" id="badgeFile" accept=".pdf,.jpg,.png,.jpeg">
            ${emp.badgeFile ? `<small class="file-note">Actuel: <a class="doc-link" href="${emp.badgeFile.data}" download="${emp.badgeFile.name}">${emp.badgeFile.name}</a></small>` : ''}
        </div>
        <div class="form-group">
            <label>J-Pass</label>
            <input type="file" id="jpassFile" accept=".pdf,.jpg,.png,.jpeg">
            ${emp.jpassFile ? `<small class="file-note">Actuel: <a class="doc-link" href="${emp.jpassFile.data}" download="${emp.jpassFile.name}">${emp.jpassFile.name}</a></small>` : ''}
        </div>
    `;
    
    document.getElementById('modal').classList.add('active');
    setupFormSubmit('employes');
}

function editEmploye(id) {
    openEmployeForm(id);
}

async function deleteEmploye(id) {
    if (confirm('Confirmer la suppression?')) {
        if (state.isOnline && supabase) {
            try {
                await supabase.from('employes').delete().eq('id', id);
            } catch (error) {
                console.error('Erreur suppression:', error);
            }
        }
        state.data.employes = state.data.employes.filter(e => e.id !== id);
        state.data.habilitations = state.data.habilitations.filter(h => h.employe_id !== id);
        saveData();
        renderEmployes();
    }
}

// ===== HABILITATIONS =====
function renderHabilitations() {
    const searchInput = document.getElementById('searchHab');
    const filterSelect = document.getElementById('filterHabType');
    const tbody = document.getElementById('habsList');

    function updateTable() {
        const search = searchInput.value.toLowerCase();
        const filter = filterSelect.value;

        let filtered = state.data.habilitations.filter(hab => {
            const employe = hab.employe || `${hab.employe_nom || ''}`;
            const matchSearch = employe.toLowerCase().includes(search);
            const matchFilter = !filter || (hab.type || hab.type_hab) === filter;
            return matchSearch && matchFilter;
        });

        tbody.innerHTML = filtered.length === 0 ? 
            '<tr><td colspan="7" class="empty">Aucune habilitation</td></tr>' :
            filtered.map(hab => {
                const expDate = new Date(hab.date_expiration || hab.dateExpiration);
                const isExpired = expDate < new Date();
                const employe = hab.employe || `${hab.prenom} ${hab.nom}` || 'Employé';
                return `
                    <tr>
                        <td>${employe}</td>
                        <td>${hab.type || hab.type_hab}</td>
                        <td>${hab.date_delivrance || hab.dateDelivrance}</td>
                        <td>${hab.date_expiration || hab.dateExpiration}</td>
                        <td>${hab.organisme}</td>
                        <td><span class="status-badge ${isExpired ? 'expire' : 'valide'}">${isExpired ? 'Expiré' : 'Valide'}</span></td>
                        <td class="flex">
                            <button class="btn btn-edit" onclick="editHabilitation(${hab.id})">✏️</button>
                            <button class="btn btn-danger btn-delete" onclick="deleteHabilitation(${hab.id})">🗑️</button>
                        </td>
                    </tr>
                `;
            }).join('');
    }

    searchInput.addEventListener('input', updateTable);
    filterSelect.addEventListener('change', updateTable);

    document.getElementById('addHabBtn').onclick = () => openHabForm();
    updateTable();
}

function openHabForm(id = null) {
    state.currentEditId = id;
    state.currentModule = 'habilitations';
    
    const hab = id ? state.data.habilitations.find(h => h.id === id) : {};
    
    document.getElementById('modalTitle').textContent = id ? 'Modifier Habilitation' : 'Ajouter Habilitation';
    
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = `
        <div class="form-group">
            <label>Employé</label>
            <select id="employe_id" required>
                <option value="">Sélectionner</option>
                ${state.data.employes.map(emp => `
                    <option value="${emp.id}" ${hab.employe_id === emp.id || hab.employeId === emp.id ? 'selected' : ''}>
                        ${emp.prenom} ${emp.nom}
                    </option>
                `).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Type Habilitation</label>
            <select id="type_hab" required>
                <option value="">Sélectionner</option>
                <option value="Permis feu" ${(hab.type || hab.type_hab) === 'Permis feu' ? 'selected' : ''}>Permis feu</option>
                <option value="Travail en hauteur" ${(hab.type || hab.type_hab) === 'Travail en hauteur' ? 'selected' : ''}>Travail en hauteur</option>
                <option value="CACES" ${(hab.type || hab.type_hab) === 'CACES' ? 'selected' : ''}>CACES</option>
                <option value="Habilitation électrique" ${(hab.type || hab.type_hab) === 'Habilitation électrique' ? 'selected' : ''}>Habilitation électrique</option>
                <option value="Espace confiné" ${(hab.type || hab.type_hab) === 'Espace confiné' ? 'selected' : ''}>Espace confiné</option>
            </select>
        </div>
        <div class="form-group">
            <label>Date Délivrance</label>
            <input type="date" id="date_delivrance" value="${hab.date_delivrance || hab.dateDelivrance || ''}" required>
        </div>
        <div class="form-group">
            <label>Date Expiration</label>
            <input type="date" id="date_expiration" value="${hab.date_expiration || hab.dateExpiration || ''}" required>
        </div>
        <div class="form-group">
            <label>Organisme</label>
            <input type="text" id="organisme" value="${hab.organisme || ''}" placeholder="CNFEC, GRETA...">
        </div>
        <div class="form-group">
            <label>Numéro Certificat</label>
            <input type="text" id="numero_cert" value="${hab.numero_cert || hab.numeroCert || ''}">
        </div>
    `;
    
    document.getElementById('modal').classList.add('active');
    setupFormSubmit('habilitations');
}

function editHabilitation(id) {
    openHabForm(id);
}

async function deleteHabilitation(id) {
    if (confirm('Confirmer la suppression?')) {
        if (state.isOnline && supabase) {
            try {
                await supabase.from('habilitations').delete().eq('id', id);
            } catch (error) {
                console.error('Erreur suppression:', error);
            }
        }
        state.data.habilitations = state.data.habilitations.filter(h => h.id !== id);
        saveData();
        renderHabilitations();
    }
}

// ===== ENGINS =====
function renderEngins() {
    const searchInput = document.getElementById('searchEngin');
    const filterSelect = document.getElementById('filterEnginType');
    const tbody = document.getElementById('enginsList');

    function updateTable() {
        const search = searchInput.value.toLowerCase();
        const filter = filterSelect.value;

        let filtered = state.data.engins.filter(eng => {
            const matchSearch = eng.designation.toLowerCase().includes(search) || 
                              eng.numero_serie.includes(search) ||
                              eng.numeroSerie.includes(search);
            const matchFilter = !filter || eng.type_engin === filter || eng.type === filter;
            return matchSearch && matchFilter;
        });

        tbody.innerHTML = filtered.length === 0 ? 
            '<tr><td colspan="7" class="empty">Aucun engin</td></tr>' :
            filtered.map(eng => `
                <tr>
                    <td>${eng.designation}</td>
                    <td>${eng.type_engin || eng.type}</td>
                    <td>${eng.numero_serie || eng.numeroSerie}</td>
                    <td>${eng.marque}</td>
                    <td>${eng.operateur_id || eng.operateurNom}</td>
                    <td><span class="status-badge active">${eng.etat}</span></td>
                    <td class="flex">
                        <button class="btn btn-edit" onclick="editEngin(${eng.id})">✏️</button>
                        <button class="btn btn-danger btn-delete" onclick="deleteEngin(${eng.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
    }

    searchInput.addEventListener('input', updateTable);
    filterSelect.addEventListener('change', updateTable);

    document.getElementById('addEnginBtn').onclick = () => openEnginForm();
    updateTable();
}

function openEnginForm(id = null) {
    state.currentEditId = id;
    state.currentModule = 'engins';
    
    const eng = id ? state.data.engins.find(e => e.id === id) : {};
    
    document.getElementById('modalTitle').textContent = id ? 'Modifier Engin' : 'Ajouter Engin';
    
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = `
        <div class="form-group">
            <label>Désignation</label>
            <input type="text" id="designation" value="${eng.designation || ''}" required>
        </div>
        <div class="form-group">
            <label>Type</label>
            <select id="type_engin" required>
                <option value="">Sélectionner</option>
                <option value="Grue mobile" ${(eng.type_engin || eng.type) === 'Grue mobile' ? 'selected' : ''}>Grue mobile</option>
                <option value="Nacelle" ${(eng.type_engin || eng.type) === 'Nacelle' ? 'selected' : ''}>Nacelle</option>
                <option value="Chariot" ${(eng.type_engin || eng.type) === 'Chariot' ? 'selected' : ''}>Chariot élévateur</option>
                <option value="Poste soudure" ${(eng.type_engin || eng.type) === 'Poste soudure' ? 'selected' : ''}>Poste à souder</option>
            </select>
        </div>
        <div class="form-group">
            <label>Numéro Série</label>
            <input type="text" id="numero_serie" value="${eng.numero_serie || eng.numeroSerie || ''}" required>
        </div>
        <div class="form-group">
            <label>Marque</label>
            <input type="text" id="marque" value="${eng.marque || ''}">
        </div>
        <div class="form-group">
            <label>Année</label>
            <input type="number" id="annee" value="${eng.annee || ''}" min="1990" max="2100">
        </div>
        <div class="form-group">
            <label>Opérateur</label>
            <input type="text" id="operateur_id" value="${eng.operateur_id || eng.operateurNom || ''}">
        </div>
        <div class="form-group">
            <label>État</label>
            <select id="etat">
                <option value="Opérationnel" ${eng.etat === 'Opérationnel' ? 'selected' : ''}>Opérationnel</option>
                <option value="Maintenance" ${eng.etat === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                <option value="Arrêté" ${eng.etat === 'Arrêté' ? 'selected' : ''}>Arrêté</option>
            </select>
        </div>
        <div class="form-group">
            <label>Date Contrôle</label>
            <input type="date" id="date_controle" value="${eng.date_controle || eng.dateControle || ''}">
        </div>
        <div class="form-group">
            <label>Prochain Contrôle</label>
            <input type="date" id="date_prochain_controle" value="${eng.date_prochain_controle || eng.dateProchain || ''}">
        </div>
        <div class="form-group">
            <label>Observations</label>
            <textarea id="observations">${eng.observations || ''}</textarea>
        </div>
    `;
    
    document.getElementById('modal').classList.add('active');
    setupFormSubmit('engins');
}

function editEngin(id) {
    openEnginForm(id);
}

async function deleteEngin(id) {
    if (confirm('Confirmer la suppression?')) {
        if (state.isOnline && supabase) {
            try {
                await supabase.from('engins').delete().eq('id', id);
            } catch (error) {
                console.error('Erreur suppression:', error);
            }
        }
        state.data.engins = state.data.engins.filter(e => e.id !== id);
        saveData();
        renderEngins();
    }
}

// ===== SOUS-TRAITANTS =====
function renderSousTraitants() {
    const searchInput = document.getElementById('searchST');
    const tbody = document.getElementById('stList');

    function updateTable() {
        const search = searchInput.value.toLowerCase();

        let filtered = state.data.sousTraitants.filter(st => {
            return st.nom_entreprise?.toLowerCase().includes(search) || 
                   st.nomEntreprise?.toLowerCase().includes(search) ||
                   st.responsable?.toLowerCase().includes(search);
        });

        tbody.innerHTML = filtered.length === 0 ? 
            '<tr><td colspan="7" class="empty">Aucun sous-traitant</td></tr>' :
            filtered.map(st => `
                <tr>
                    <td>${st.nom_entreprise || st.nomEntreprise}</td>
                    <td>${st.specialite}</td>
                    <td>${st.responsable}</td>
                    <td>${st.telephone}</td>
                    <td>${st.effectif}</td>
                    <td><span class="status-badge ${st.statut === 'Actif' ? 'active' : 'inactive'}">${st.statut}</span></td>
                    <td class="flex">
                        <button class="btn btn-edit" onclick="editST(${st.id})">✏️</button>
                        <button class="btn btn-danger btn-delete" onclick="deleteST(${st.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
    }

    searchInput.addEventListener('input', updateTable);

    document.getElementById('addSTBtn').onclick = () => openSTForm();
    updateTable();
}

function openSTForm(id = null) {
    state.currentEditId = id;
    state.currentModule = 'sousTraitants';
    
    const st = id ? state.data.sousTraitants.find(s => s.id === id) : {};
    
    document.getElementById('modalTitle').textContent = id ? 'Modifier Sous-traitant' : 'Ajouter Sous-traitant';
    
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = `
        <div class="form-group">
            <label>Nom Entreprise</label>
            <input type="text" id="nom_entreprise" value="${st.nom_entreprise || st.nomEntreprise || ''}" required>
        </div>
        <div class="form-group">
            <label>Spécialité</label>
            <input type="text" id="specialite" value="${st.specialite || ''}" placeholder="Soudure, Électricité...">
        </div>
        <div class="form-group">
            <label>Responsable</label>
            <input type="text" id="responsable" value="${st.responsable || ''}">
        </div>
        <div class="form-group">
            <label>Téléphone</label>
            <input type="tel" id="telephone" value="${st.telephone || ''}">
        </div>
        <div class="form-group">
            <label>Email</label>
            <input type="email" id="email" value="${st.email || ''}">
        </div>
        <div class="form-group">
            <label>Effectif</label>
            <input type="number" id="effectif" value="${st.effectif || 1}" min="1">
        </div>
        <div class="form-group">
            <label>Date Début</label>
            <input type="date" id="date_debut" value="${st.date_debut || st.dateDebut || ''}">
        </div>
        <div class="form-group">
            <label>Date Fin</label>
            <input type="date" id="date_fin" value="${st.date_fin || st.dateFin || ''}">
        </div>
        <div class="form-group">
            <label>Statut</label>
            <select id="statut">
                <option value="Actif" ${st.statut === 'Actif' ? 'selected' : ''}>Actif</option>
                <option value="Inactif" ${st.statut === 'Inactif' ? 'selected' : ''}>Inactif</option>
            </select>
        </div>
        <div class="form-group">
            <label>Notes</label>
            <textarea id="notes">${st.notes || ''}</textarea>
        </div>
    `;
    
    document.getElementById('modal').classList.add('active');
    setupFormSubmit('sousTraitants');
}

function editST(id) {
    openSTForm(id);
}

async function deleteST(id) {
    if (confirm('Confirmer la suppression?')) {
        if (state.isOnline && supabase) {
            try {
                await supabase.from('sous_traitants').delete().eq('id', id);
            } catch (error) {
                console.error('Erreur suppression:', error);
            }
        }
        state.data.sousTraitants = state.data.sousTraitants.filter(s => s.id !== id);
        saveData();
        renderSousTraitants();
    }
}

// ===== ACCES & BADGES =====
function renderAcces() {
    const searchInput = document.getElementById('searchBadge');
    const filterSelect = document.getElementById('filterZone');
    const tbody = document.getElementById('badgesList');

    function updateTable() {
        const search = searchInput.value.toLowerCase();
        const filter = filterSelect.value;

        let filtered = state.data.badges.filter(badge => {
            const employeNom = badge.employe_nom || badge.employeNom || '';
            const matchSearch = employeNom.toLowerCase().includes(search) || 
                              (badge.numero_badge || badge.numeroBadge || '').includes(search);
            const matchFilter = !filter || (badge.zone_autorisee || badge.zoneAutorisee) === filter;
            return matchSearch && matchFilter;
        });

        tbody.innerHTML = filtered.length === 0 ? 
            '<tr><td colspan="7" class="empty">Aucun badge</td></tr>' :
            filtered.map(badge => `
                <tr>
                    <td>${badge.employe_nom || badge.employeNom}</td>
                    <td>${badge.numero_badge || badge.numeroBadge}</td>
                    <td>${badge.type_porteur || badge.typePorteur}</td>
                    <td>${badge.zone_autorisee || badge.zoneAutorisee}</td>
                    <td>${badge.date_validite || badge.dateValidite}</td>
                    <td><span class="status-badge ${(badge.statut || '').includes('Actif') ? 'active' : 'inactive'}">${badge.statut}</span></td>
                    <td class="flex">
                        <button class="btn btn-edit" onclick="editBadge(${badge.id})">✏️</button>
                        <button class="btn btn-danger btn-delete" onclick="deleteBadge(${badge.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
    }

    searchInput.addEventListener('input', updateTable);
    filterSelect.addEventListener('change', updateTable);

    document.getElementById('addBadgeBtn').onclick = () => openBadgeForm();
    updateTable();
}

function openBadgeForm(id = null) {
    state.currentEditId = id;
    state.currentModule = 'badges';
    
    const badge = id ? state.data.badges.find(b => b.id === id) : {};
    
    document.getElementById('modalTitle').textContent = id ? 'Modifier Badge' : 'Ajouter Badge';
    
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = `
        <div class="form-group">
            <label>Employé</label>
            <select id="employe_nom" required>
                <option value="">Sélectionner</option>
                ${state.data.employes.map(emp => `
                    <option value="${emp.prenom} ${emp.nom}" ${(badge.employe_nom || badge.employeNom) === `${emp.prenom} ${emp.nom}` ? 'selected' : ''}>
                        ${emp.prenom} ${emp.nom}
                    </option>
                `).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Numéro Badge</label>
            <input type="text" id="numero_badge" value="${badge.numero_badge || badge.numeroBadge || ''}" placeholder="KCM001" required>
        </div>
        <div class="form-group">
            <label>Type Porteur</label>
            <select id="type_porteur">
                <option value="Employé" ${(badge.type_porteur || badge.typePorteur) === 'Employé' ? 'selected' : ''}>Employé</option>
                <option value="Sous-traitant" ${(badge.type_porteur || badge.typePorteur) === 'Sous-traitant' ? 'selected' : ''}>Sous-traitant</option>
                <option value="Visiteur" ${(badge.type_porteur || badge.typePorteur) === 'Visiteur' ? 'selected' : ''}>Visiteur</option>
            </select>
        </div>
        <div class="form-group">
            <label>Zone Autorisée</label>
            <select id="zone_autorisee" required>
                <option value="">Sélectionner</option>
                <option value="Bureau" ${(badge.zone_autorisee || badge.zoneAutorisee) === 'Bureau' ? 'selected' : ''}>Bureau</option>
                <option value="Soudure" ${(badge.zone_autorisee || badge.zoneAutorisee) === 'Soudure' ? 'selected' : ''}>Zone Soudure</option>
                <option value="Montage" ${(badge.zone_autorisee || badge.zoneAutorisee) === 'Montage' ? 'selected' : ''}>Zone Montage</option>
                <option value="Engins" ${(badge.zone_autorisee || badge.zoneAutorisee) === 'Engins' ? 'selected' : ''}>Zone Engins Lourds</option>
                <option value="Complet" ${(badge.zone_autorisee || badge.zoneAutorisee) === 'Complet' ? 'selected' : ''}>Accès Complet</option>
            </select>
        </div>
        <div class="form-group">
            <label>Date Validité</label>
            <input type="date" id="date_validite" value="${badge.date_validite || badge.dateValidite || ''}" required>
        </div>
        <div class="form-group">
            <label>Date Émission</label>
            <input type="date" id="date_emission" value="${badge.date_emission || badge.dateEmission || ''}">
        </div>
        <div class="form-group">
            <label>Statut</label>
            <select id="statut">
                <option value="Actif" ${badge.statut === 'Actif' ? 'selected' : ''}>Actif</option>
                <option value="Inactif" ${badge.statut === 'Inactif' ? 'selected' : ''}>Inactif</option>
            </select>
        </div>
    `;
    
    document.getElementById('modal').classList.add('active');
    setupFormSubmit('badges');
}

function editBadge(id) {
    openBadgeForm(id);
}

async function deleteBadge(id) {
    if (confirm('Confirmer la suppression?')) {
        if (state.isOnline && supabase) {
            try {
                await supabase.from('badges').delete().eq('id', id);
            } catch (error) {
                console.error('Erreur suppression:', error);
            }
        }
        state.data.badges = state.data.badges.filter(b => b.id !== id);
        saveData();
        renderAcces();
    }
}

// ===== FORM SUBMIT =====
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

async function uploadFile(file, bucket, path) {
    if (!file) return null;
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function setupFormSubmit(module) {
    const form = document.getElementById('dynamicForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        let formData = {};
        const inputs = form.querySelectorAll('input:not([type="file"]), select, textarea');
        inputs.forEach(input => {
            formData[input.id] = input.value;
        });

        // Handle file uploads for employes
        if (module === 'employes') {
            const cinInput = document.getElementById('cinFile');
            const anthropometricInput = document.getElementById('anthropometricFile');
            const photosInput = document.getElementById('photosFile');
            const badgeInput = document.getElementById('badgeFile');
            const jpassInput = document.getElementById('jpassFile');

            if (state.isOnline && supabase) {
                // Upload to Supabase cloud
                try {
                    if (cinInput?.files?.[0]) {
                        const file = cinInput.files[0];
                        const path = `employes/${Date.now()}_cin_${file.name}`;
                        formData.cin_file_url = await uploadFile(file, 'kader-documents', path);
                    }
                    if (anthropometricInput?.files?.[0]) {
                        const file = anthropometricInput.files[0];
                        const path = `employes/${Date.now()}_anthropometric_${file.name}`;
                        formData.anthropometric_file_url = await uploadFile(file, 'kader-documents', path);
                    }
                    if (photosInput?.files?.length) {
                        formData.photos_urls = [];
                        for (let file of photosInput.files) {
                            const path = `employes/${Date.now()}_photo_${file.name}`;
                            const url = await uploadFile(file, 'kader-documents', path);
                            formData.photos_urls.push(url);
                        }
                    }
                    if (badgeInput?.files?.[0]) {
                        const file = badgeInput.files[0];
                        const path = `employes/${Date.now()}_badge_${file.name}`;
                        formData.badge_file_url = await uploadFile(file, 'kader-documents', path);
                    }
                    if (jpassInput?.files?.[0]) {
                        const file = jpassInput.files[0];
                        const path = `employes/${Date.now()}_jpass_${file.name}`;
                        formData.jpass_file_url = await uploadFile(file, 'kader-documents', path);
                    }
                } catch (error) {
                    console.error('Erreur upload fichiers:', error);
                }
            } else {
                // Store locally with base64
                if (cinInput?.files?.[0]) {
                    const file = cinInput.files[0];
                    formData.cinFile = { name: file.name, data: await readFileAsDataURL(file) };
                }
                if (anthropometricInput?.files?.[0]) {
                    const file = anthropometricInput.files[0];
                    formData.anthropometricFile = { name: file.name, data: await readFileAsDataURL(file) };
                }
                if (photosInput?.files?.length) {
                    formData.photosFiles = [];
                    for (const file of Array.from(photosInput.files)) {
                        formData.photosFiles.push({ name: file.name, data: await readFileAsDataURL(file) });
                    }
                }
                if (badgeInput?.files?.[0]) {
                    const file = badgeInput.files[0];
                    formData.badgeFile = { name: file.name, data: await readFileAsDataURL(file) };
                }
                if (jpassInput?.files?.[0]) {
                    const file = jpassInput.files[0];
                    formData.jpassFile = { name: file.name, data: await readFileAsDataURL(file) };
                }
            }
        }

        if (state.currentEditId) {
            // Update
            const item = state.data[module].find(i => i.id === state.currentEditId);
            if (item) {
                Object.assign(item, formData);
                if (state.isOnline && supabase) {
                    const tableName = module === 'sousTraitants' ? 'sous_traitants' : module;
                    try {
                        await supabase.from(tableName).update(formData).eq('id', state.currentEditId);
                    } catch (error) {
                        console.error('Erreur update:', error);
                    }
                }
            }
        } else {
            // Insert
            const maxId = Math.max(...state.data[module].map(i => i.id || 0), 0);
            formData.id = maxId + 1;

            state.data[module].push(formData);

            if (state.isOnline && supabase) {
                const tableName = module === 'sousTraitants' ? 'sous_traitants' : module;
                try {
                    await supabase.from(tableName).insert([formData]);
                } catch (error) {
                    console.error('Erreur insert:', error);
                }
            }
        }

        saveData();
        closeModal();

        if (module === 'employes') renderEmployes();
        else if (module === 'habilitations') renderHabilitations();
        else if (module === 'engins') renderEngins();
        else if (module === 'sousTraitants') renderSousTraitants();
        else if (module === 'badges') renderAcces();
    };
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('dynamicForm').reset();
}

// ===== EXPORT FUNCTIONS =====
function exportToExcel(module) {
    const data = state.data[module];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, module);
    XLSX.writeFile(wb, `${module}-${new Date().toISOString().split('T')[0]}.xlsx`);
}

function exportToPDF(module) {
    const element = createTableForExport(module);
    const opt = {
        margin: 10,
        filename: `${module}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
}

function createTableForExport(module) {
    const data = state.data[module];
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    if (data.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Aucune donnée à exporter';
        return p;
    }
    
    const headers = Object.keys(data[0] || {});
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.border = '1px solid black';
        th.style.padding = '8px';
        headerRow.appendChild(th);
    });
    
    const tbody = table.createTBody();
    data.forEach(row => {
        const tr = tbody.insertRow();
        headers.forEach(header => {
            const td = tr.insertCell();
            td.textContent = row[header] || '';
            td.style.border = '1px solid black';
            td.style.padding = '8px';
        });
    });
    
    return table;
}

function exportCompletReport() {
    const report = `
        <h1>Rapport Complet - Kader CM</h1>
        <h2>Date: ${new Date().toLocaleDateString('fr-FR')}</h2>
        
        <h3>Employés (${state.data.employes.length})</h3>
        ${createTableForExport('employes').outerHTML}
        
        <h3>Habilitations (${state.data.habilitations.length})</h3>
        ${createTableForExport('habilitations').outerHTML}
        
        <h3>Engins (${state.data.engins.length})</h3>
        ${createTableForExport('engins').outerHTML}
        
        <h3>Sous-traitants (${state.data.sousTraitants.length})</h3>
        ${createTableForExport('sousTraitants').outerHTML}
        
        <h3>Badges (${state.data.badges.length})</h3>
        ${createTableForExport('badges').outerHTML}
    `;
    
    const opt = {
        margin: 10,
        filename: `rapport-complet-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape' }
    };
    html2pdf().set(opt).from(report).save();
}

// Log setup status
console.log('✅ KADER CM - Configuration:', {
    supabaseActive: state.isOnline,
    dataItems: state.data
});
