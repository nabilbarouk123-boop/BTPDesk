// ===== KADER CM - Application Complète avec Supabase =====

// ===== SUPABASE CONFIGURATION =====
const SUPABASE_URL = localStorage.getItem('SUPABASE_URL') || '';
const SUPABASE_KEY = localStorage.getItem('SUPABASE_KEY') || '';

let supabase = null;

// Initialize Supabase if credentials exist and the library loaded successfully
if (SUPABASE_URL && SUPABASE_KEY && window.supabase && typeof window.supabase.createClient === 'function') {
        const { createClient } = window.supabase;
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else if (SUPABASE_URL && SUPABASE_KEY) {
        console.warn('Supabase library non chargée. Bascule en mode local.');
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
            { id: 2, employeNom: 'Alaoui Karim', numeroBadge: 'KCM002', typePorteur: 'Soudure', zoneAutorisee: 'Soudure', dateValidite: '2025-12-31', dateEmission: '2024-01-01', statut: 'Actif' }
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
                                          state.isOnline = await checkSupabaseAvailable();
                                          if (state.isOnline) {
                                                          await loadDataFromSupabase();
                                          } else {
                                                          state.data = JSON.parse(localStorage.getItem('kaderCMData')) || defaultData;
                                          }
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
...
