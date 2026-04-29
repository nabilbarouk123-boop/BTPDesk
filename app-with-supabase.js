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
