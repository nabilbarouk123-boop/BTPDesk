# 📋 GUIDE COMPLET - Configuration Utilisateurs BTPDesk
## Kader Construction Métallique

---

## 🔐 **1. SYSTÈME D'AUTHENTIFICATION**

### **Rôles Disponibles :**
- **👑 Admin** : Accès complet à tous les modules et paramètres
- **👥 RH** : Gestion des employés, habilitations et rapports RH
- **👷 Employé** : Accès limité aux données personnelles
- **🛡️ HSE** : Focus sécurité, habilitations et contrôles

### **Comptes de Démonstration :**
```
Admin:     admin@kader.com     / admin123
RH:        rh@kader.com        / rh123
Employé:   employe@kader.com   / emp123
HSE:       hse@kader.com       / hse123
```

---

## 🚀 **2. CONFIGURATION SUPABASE**

### **Étape 1 : Créer des Utilisateurs Réels**

1. **Aller sur Supabase Dashboard :**
   ```
   https://supabase.com/dashboard/projects
   ```

2. **Sélectionner votre projet BTPDesk**

3. **Aller dans "Authentication" → "Users"**

4. **Cliquer "Add user" et créer :**
   - Email + Mot de passe
   - Rôle dans les métadonnées

### **Étape 2 : Configuration des Profils**

Dans l'onglet "SQL Editor", exécuter :

```sql
-- Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nom TEXT,
  prenom TEXT,
  role TEXT CHECK (role IN ('admin', 'rh', 'employe', 'hse')),
  telephone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### **Étape 3 : Insérer les Profils**

```sql
-- Exemple d'insertion de profils
INSERT INTO profiles (id, nom, prenom, role, telephone) VALUES
  ('user-id-1', 'Admin', 'Kader', 'admin', '+212600000000'),
  ('user-id-2', 'Responsable', 'RH', 'rh', '+212600000001'),
  ('user-id-3', 'Dupont', 'Jean', 'employe', '+212600000002'),
  ('user-id-4', 'Sécurité', 'HSE', 'hse', '+212600000003');
```

---

## 📚 **3. FORMATION UTILISATEURS**

### **🖥️ Interface Principale**

#### **Connexion :**
1. Ouvrir : `https://nabilbarouk123-boop.github.io/BTPDesk/`
2. Entrer email + mot de passe
3. Sélectionner module souhaité

#### **Navigation :**
- **Menu latéral** : Accès rapide aux modules
- **Tableau de bord** : Vue d'ensemble des données
- **Recherche** : Filtrage en temps réel
- **Exports** : Excel/PDF disponibles

### **👥 Module Employés**

#### **Ajouter un Employé :**
1. Cliquer "➕ Nouveau"
2. Remplir informations personnelles
3. **Upload documents :**
   - CIN (Carte d'Identité)
   - Fiche anthropométrique
   - Photos (multiple)
   - Badge
   - J-Pass

#### **Gestion des Documents :**
- **Format accepté** : PDF, JPG, PNG
- **Taille max** : 10MB par fichier
- **Stockage** : Cloud Supabase sécurisé
- **Visualisation** : Clic pour ouvrir

### **🎓 Module Habilitations**

#### **Créer une Habilitation :**
1. Sélectionner employé
2. Type d'habilitation :
   - Travail en hauteur
   - Permis feu
   - CACES
   - Électrique
   - Etc.
3. Date de délivrance + expiration
4. Organisme certificateur

#### **Alertes Automatiques :**
- ⚠️ **30 jours** avant expiration
- ❌ **Expiré** = accès refusé

### **🚛 Module Engins**

#### **Fiche Technique :**
- Désignation complète
- Numéro de série
- Marque + année
- Opérateur assigné
- État opérationnel

#### **Contrôles Périodiques :**
- Date dernier contrôle
- Date prochain contrôle
- Observations techniques

### **🏢 Module Sous-traitants**

#### **Informations Requises :**
- Nom entreprise
- Spécialité
- Responsable + contact
- Effectif
- Période de contrat
- Statut actif/inactif

### **🆔 Module Badges**

#### **Gestion d'Accès :**
- Numéro unique de badge
- Type de porteur
- Zones autorisées
- Date de validité
- Statut actif/inactif

---

## ⚙️ **4. AJOUT DE NOUVELLES FONCTIONNALITÉS**

### **Fonctionnalités Demandées :**

#### **A. Notifications par Email**
```javascript
// Intégration future
function sendExpirationAlert(habilitation) {
    // Alertes 30 jours avant expiration
    // Email automatique aux responsables
}
```

#### **B. Code QR pour Badges**
```javascript
// Génération QR code
function generateBadgeQR(badgeData) {
    // QR code avec infos employé
    // Impression directe
}
```

#### **C. Géolocalisation Engins**
```javascript
// Tracking GPS
function trackEquipmentLocation(equipmentId) {
    // Position temps réel
    // Historique déplacements
}
```

#### **D. API REST Externe**
```javascript
// Pour intégrations tierces
app.get('/api/employees', authenticate, (req, res) => {
    // Export données JSON
});
```

#### **E. Dashboard Analytics**
```javascript
// Statistiques avancées
function generateAnalytics() {
    // Graphiques employés par poste
    // Taux rotation personnel
    // Coûts formation
}
```

---

## 🆘 **5. SUPPORT TECHNIQUE**

### **🔧 Dépannage Courant**

#### **Problème : Connexion impossible**
**Solution :**
1. Vérifier email/mot de passe
2. Vérifier connexion internet
3. Vider cache navigateur
4. Contacter admin pour reset

#### **Problème : Upload fichiers échoue**
**Solution :**
1. Vérifier format (PDF/JPG/PNG)
2. Vérifier taille (< 10MB)
3. Vérifier connexion Supabase
4. Réessayer upload

#### **Problème : Données ne s'affichent pas**
**Solution :**
1. Actualiser la page (F5)
2. Vérifier permissions utilisateur
3. Vider localStorage
4. Contacter administrateur

### **📞 Contact Support**

**Email :** support@kader-construction.ma
**Téléphone :** +212 6 XX XX XX XX
**Disponibilité :** 8h-18h (Lundi-Vendredi)

### **🚨 Support Prioritaire**
- **Urgent** : Système indisponible
- **Haute** : Perte de données
- **Normale** : Questions fonctionnelles
- **Basse** : Améliorations

---

## 📈 **6. MAINTENANCE ET ÉVOLUTION**

### **Sauvegardes Automatiques**
- Base de données : Quotidienne
- Fichiers : Cloud Supabase
- Logs : 30 jours conservation

### **Mises à Jour**
- **Hebdomadaire** : Corrections bugs
- **Mensuel** : Nouvelles fonctionnalités
- **Trimestriel** : Améliorations majeures

### **Monitoring**
- Uptime plateforme
- Performance requêtes
- Utilisation stockage
- Logs erreurs

---

**📝 Document créé le :** 29 Avril 2026
**👨‍💼 Responsable :** Équipe Technique Kader CM
**📧 Contact :** tech@kader-construction.ma</content>
<parameter name="filePath">c:\Users\user\OneDrive\Desktop\NN\GUIDE_UTILISATEURS_COMPLET.md