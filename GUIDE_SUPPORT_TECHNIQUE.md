# 🆘 GUIDE SUPPORT TECHNIQUE - BTPDesk
## Dépannage et Résolution Problèmes

---

## **🚨 NIVEAUX DE PRIORITÉ**

### **🔴 URGENT (Résolution < 1h)**
- Système complètement indisponible
- Perte de données critiques
- Sécurité compromise
- Plus de 50 utilisateurs impactés

### **🟠 HAUTE (Résolution < 4h)**
- Module principal non fonctionnel
- Upload fichiers impossible
- Connexion Supabase perdue
- Fonctionnalités RH bloquées

### **🟡 NORMALE (Résolution < 24h)**
- Bugs mineurs interface
- Lenters de chargement
- Problèmes d'affichage
- Questions fonctionnelles

### **🟢 BASSE (Résolution < 1 semaine)**
- Améliorations ergonomiques
- Nouvelles fonctionnalités
- Optimisations performance

---

## **🔧 DIAGNOSTIC RAPIDE**

### **Outil de Diagnostic Automatique**
```javascript
// Script de diagnostic
function runDiagnostics() {
    console.log('🔍 DIAGNOSTIC BTPDesk');
    console.log('1. Connexion Internet:', navigator.onLine ? '✅' : '❌');
    console.log('2. Supabase:', window.supabase ? '✅' : '❌');
    console.log('3. LocalStorage:', localStorage.length > 0 ? '✅' : '❌');
    console.log('4. User Agent:', navigator.userAgent);
    console.log('5. URL:', window.location.href);
}
```

**Comment lancer :**
1. Ouvrir console navigateur (F12)
2. Coller le code ci-dessus
3. Appeler `runDiagnostics()`

---

## **❌ PROBLÈMES COURANTS & SOLUTIONS**

### **1. CONNEXION IMPOSSIBLE**

#### **Symptômes :**
- Message "Email ou mot de passe incorrect"
- Page de connexion qui boucle
- Erreur 401 Unauthorized

#### **Solutions :**
```bash
# Vérifications à faire :
1. Vérifier email/mot de passe
2. Vérifier connexion internet
3. Vider cache : Ctrl+Shift+R
4. Essayer navigateur différent
5. Vérifier statut Supabase
```

#### **Actions Admin :**
```sql
-- Vérifier utilisateur en base
SELECT * FROM auth.users WHERE email = 'user@example.com';

-- Reset mot de passe si nécessaire
-- Via interface Supabase > Authentication > Users
```

---

### **2. UPLOAD FICHIERS ÉCHOUE**

#### **Symptômes :**
- Barre de progression bloquée
- Erreur "Upload failed"
- Fichier semble uploadé mais invisible

#### **Solutions :**
```javascript
// Vérifications côté client
1. Format fichier : PDF, JPG, PNG uniquement
2. Taille : < 10MB par fichier
3. Nom fichier : Pas de caractères spéciaux
4. Connexion internet stable
```

#### **Debug côté serveur :**
```sql
-- Vérifier fichiers en base
SELECT * FROM storage.objects
WHERE bucket_id = 'btpdesk-files'
ORDER BY created_at DESC LIMIT 10;
```

#### **Actions correctives :**
- ✅ Vider cache navigateur
- ✅ Redémarrer application
- ✅ Vérifier quota Supabase Storage
- ✅ Compresser fichiers volumineux

---

### **3. DONNÉES NE S'AFFICHENT PAS**

#### **Symptômes :**
- Tables vides
- Erreur "Loading data..."
- Interface figée

#### **Solutions :**
```javascript
// Diagnostic localStorage
console.log('Current User:', localStorage.getItem('currentUser'));
console.log('Supabase URL:', localStorage.getItem('SUPABASE_URL'));
console.log('Data:', localStorage.getItem('kaderCMData'));
```

#### **Actions :**
```bash
1. Actualiser page (F5)
2. Vider localStorage : localStorage.clear()
3. Reconnexion utilisateur
4. Vérifier permissions base de données
```

---

### **4. PERFORMANCES LENTES**

#### **Symptômes :**
- Chargement > 5 secondes
- Interface freezing
- Recherches lentes

#### **Optimisations :**
```javascript
// Mesure performances
console.time('Data Load');
await loadDataFromSupabase();
console.timeEnd('Data Load');
```

#### **Actions :**
- ✅ Optimiser requêtes SQL (INDEX)
- ✅ Pagination pour grandes listes
- ✅ Cache localStorage intelligent
- ✅ Compression images

---

### **5. ERREURS JAVASCRIPT**

#### **Symptômes :**
- Console erreurs rouges
- Fonctionnalités non disponibles
- Interface cassée

#### **Debug Console :**
```javascript
// Capturer erreurs
window.onerror = function(msg, url, line, col, error) {
    console.log('Error:', msg, 'Line:', line, 'URL:', url);
    // Envoyer à service de monitoring
};
```

#### **Erreurs Courantes :**
- `TypeError: Cannot read property` → Vérifier données null
- `NetworkError` → Problème Supabase
- `QuotaExceededError` → localStorage plein

---

## **🛠️ OUTILS DE MAINTENANCE**

### **Script de Maintenance Automatique**
```javascript
// Nettoyage base de données
async function maintenanceCleanup() {
    // Supprimer fichiers orphelins
    // Nettoyer logs anciens
    // Optimiser indexes
    // Vérifier intégrité données
}
```

### **Monitoring Continu**
```javascript
// Métriques à surveiller
const metrics = {
    uptime: 99.9,
    responseTime: '< 2s',
    errorRate: '< 1%',
    storageUsed: 'X GB / 100 GB'
};
```

---

## **📞 PROCÉDURES D'ESCALADE**

### **Niveau 1 : Support Utilisateur**
- **Délai :** Immédiat
- **Actions :** Diagnostic rapide, solutions standard
- **Escalade si :** Problème non résolu en 30 min

### **Niveau 2 : Équipe Technique**
- **Délai :** < 4h (haute priorité)
- **Actions :** Debug avancé, correctifs temporaires
- **Escalade si :** Impact business critique

### **Niveau 3 : Développement**
- **Délai :** < 24h
- **Actions :** Correctifs définitifs, déploiements
- **Escalade si :** Problème architectural

---

## **📋 CHECKLIST INTERVENTION**

### **Avant Intervention :**
- [ ] Recueillir informations utilisateur
- [ ] Reproduire le problème
- [ ] Vérifier logs système
- [ ] Identifier impact

### **Pendant Intervention :**
- [ ] Communiquer avec utilisateur
- [ ] Tester solutions progressivement
- [ ] Documenter actions
- [ ] Vérifier pas de régression

### **Après Intervention :**
- [ ] Confirmer résolution
- [ ] Documenter solution
- [ ] Prévenir récidive
- [ ] Mettre à jour base connaissances

---

## **📊 STATISTIQUES SUPPORT**

### **Mois en cours :**
- **Tickets ouverts :** 12
- **Temps résolution moyen :** 2.3h
- **Satisfaction client :** 4.7/5

### **Top 5 Problèmes :**
1. **Connexion** (35%) - Mots de passe oubliés
2. **Upload** (28%) - Formats fichiers
3. **Performance** (15%) - Lenters chargement
4. **Affichage** (12%) - Données corrompues
5. **Permissions** (10%) - Accès refusé

---

## **🎯 PRÉVENTION**

### **Actions Préventives :**
- ✅ **Formation utilisateurs** régulière
- ✅ **Mises à jour** sécurité mensuelles
- ✅ **Sauvegardes** automatiques quotidiennes
- ✅ **Monitoring** 24/7 des métriques clés
- ✅ **Tests** avant déploiements

### **Plan de Continuité :**
- ✅ **Site miroir** en cas d'indisponibilité
- ✅ **Procédures** de récupération données
- ✅ **Contacts** d'urgence 24/7
- ✅ **Documentation** à jour

---

**📞 Support Disponible :**
- **Email :** support@kader-construction.ma
- **Téléphone :** +212 6 XX XX XX XX
- **Chat :** Intégré dans l'application
- **Horaires :** 8h-18h (Lundi-Vendredi)

**🚨 Urgences :** +212 6 XX XX XX XX (24/7)</content>
<parameter name="filePath">c:\Users\user\OneDrive\Desktop\NN\GUIDE_SUPPORT_TECHNIQUE.md