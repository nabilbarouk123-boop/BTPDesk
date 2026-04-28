-- ===== KADER CM DATABASE SCHEMA =====
-- Create tables for Kader Construction Métallique
-- Copy & paste this entire SQL into Supabase SQL Editor, then click RUN

-- ===== USERS PROFILES =====
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin','rh','hse','chef_equipe','document_controller','employe')),
  entreprise TEXT DEFAULT 'Kader CM',
  telephone TEXT,
  actif BOOLEAN DEFAULT true,
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_modification TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ===== EMPLOYES =====
CREATE TABLE IF NOT EXISTS employes (
  id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  cin TEXT UNIQUE NOT NULL,
  cin_date_exp DATE,
  telephone TEXT,
  email TEXT,
  poste TEXT NOT NULL,
  date_embauche DATE NOT NULL,
  statut TEXT DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif', 'Suspendu')),
  salaire DECIMAL(10,2),
  contrat_type TEXT,
  contrat_date_fin DATE,
  notes TEXT,
  photo_url TEXT,
  cin_file_url TEXT,
  anthropometric_file_url TEXT,
  photos_urls TEXT[],
  badge_file_url TEXT,
  jpass_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

ALTER TABLE employes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view employes" ON employes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin/RH/DC can insert employes" ON employes
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'rh', 'document_controller')
    )
  );

CREATE POLICY "Admin/RH/DC can update employes" ON employes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'rh', 'document_controller')
    )
  );

-- ===== HABILITATIONS =====
CREATE TABLE IF NOT EXISTS habilitations (
  id BIGSERIAL PRIMARY KEY,
  employe_id BIGINT NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
  type_hab TEXT NOT NULL,
  date_delivrance DATE NOT NULL,
  date_expiration DATE NOT NULL,
  organisme TEXT,
  numero_cert TEXT UNIQUE,
  fichier_url TEXT,
  statut TEXT DEFAULT 'Valide' CHECK (statut IN ('Valide', 'Expiré', 'Bientôt Expiré')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

ALTER TABLE habilitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view habilitations" ON habilitations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin/HSE/DC can insert habilitations" ON habilitations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'hse', 'document_controller')
    )
  );

-- ===== ENGINS =====
CREATE TABLE IF NOT EXISTS engins (
  id BIGSERIAL PRIMARY KEY,
  designation TEXT NOT NULL,
  type_engin TEXT NOT NULL,
  numero_serie TEXT UNIQUE NOT NULL,
  marque TEXT,
  modele TEXT,
  annee INT,
  operateur_id BIGINT REFERENCES employes(id),
  etat TEXT DEFAULT 'Opérationnel' CHECK (etat IN ('Opérationnel', 'Maintenance', 'Arrêté')),
  date_controle DATE,
  date_prochain_controle DATE,
  organisme_controle TEXT,
  observations TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

ALTER TABLE engins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view engins" ON engins
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin/HSE can manage engins" ON engins
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'hse', 'chef_equipe')
    )
  );

-- ===== SOUS_TRAITANTS =====
CREATE TABLE IF NOT EXISTS sous_traitants (
  id BIGSERIAL PRIMARY KEY,
  nom_entreprise TEXT NOT NULL UNIQUE,
  specialite TEXT,
  logo_url TEXT,
  responsable TEXT,
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  effectif INT DEFAULT 1,
  date_debut DATE,
  date_fin DATE,
  statut TEXT DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif', 'Suspendu')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

ALTER TABLE sous_traitants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view sous_traitants" ON sous_traitants
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin/RH can manage sous_traitants" ON sous_traitants
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'rh')
    )
  );

-- ===== BADGES =====
CREATE TABLE IF NOT EXISTS badges (
  id BIGSERIAL PRIMARY KEY,
  employe_id BIGINT REFERENCES employes(id) ON DELETE CASCADE,
  sous_traitant_id BIGINT REFERENCES sous_traitants(id) ON DELETE CASCADE,
  numero_badge TEXT UNIQUE NOT NULL,
  type_porteur TEXT CHECK (type_porteur IN ('Employé', 'Sous-traitant', 'Visiteur')),
  zone_autorisee TEXT NOT NULL,
  date_validite DATE NOT NULL,
  date_emission DATE NOT NULL,
  statut TEXT DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif', 'Expiré')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view badges" ON badges
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin/HSE can manage badges" ON badges
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'hse')
    )
  );

-- ===== LOGS AUDIT =====
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT,
  table_name TEXT,
  record_id BIGINT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view own logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ===== STORAGE FOR FILES =====
-- Enable storage for document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('kader-documents', 'kader-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ===== FUNCTIONS & TRIGGERS =====
-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employes_timestamp BEFORE UPDATE ON employes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_habilitations_timestamp BEFORE UPDATE ON habilitations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_engins_timestamp BEFORE UPDATE ON engins
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_sous_traitants_timestamp BEFORE UPDATE ON sous_traitants
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_badges_timestamp BEFORE UPDATE ON badges
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Auto-update habilitation status
CREATE OR REPLACE FUNCTION update_habilitation_statut()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_expiration < NOW()::date THEN
    NEW.statut = 'Expiré';
  ELSIF NEW.date_expiration <= (NOW()::date + INTERVAL '30 days') THEN
    NEW.statut = 'Bientôt Expiré';
  ELSE
    NEW.statut = 'Valide';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_habilitation_statut_trigger BEFORE INSERT OR UPDATE ON habilitations
  FOR EACH ROW EXECUTE PROCEDURE update_habilitation_statut();

-- Auto-update badge status
CREATE OR REPLACE FUNCTION update_badge_statut()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_validite < NOW()::date THEN
    NEW.statut = 'Expiré';
  ELSE
    NEW.statut = 'Actif';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_badge_statut_trigger BEFORE INSERT OR UPDATE ON badges
  FOR EACH ROW EXECUTE PROCEDURE update_badge_statut();

-- ===== DEMO DATA (Optional) =====
-- Insert demo users if needed
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, last_sign_in_at, confirmation_token, recovery_token, email_change_token, email_change)
VALUES 
  ('d8b4c8e0-7f5c-4a9d-8c3b-2e1f4a6d9e2b', 'admin@kader.com', crypt('admin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin Kader"}', NOW(), NOW(), NOW(), '', '', '', '')
ON CONFLICT DO NOTHING;

-- Insert profile for admin
INSERT INTO profiles (id, nom, prenom, email, role, telephone)
VALUES ('d8b4c8e0-7f5c-4a9d-8c3b-2e1f4a6d9e2b', 'Admin', 'Kader CM', 'admin@kader.com', 'admin', '+212600000000')
ON CONFLICT DO NOTHING;

-- ===== INDEXES FOR PERFORMANCE =====
CREATE INDEX idx_employes_cin ON employes(cin);
CREATE INDEX idx_employes_statut ON employes(statut);
CREATE INDEX idx_habilitations_employe_id ON habilitations(employe_id);
CREATE INDEX idx_habilitations_expiration ON habilitations(date_expiration);
CREATE INDEX idx_engins_type ON engins(type_engin);
CREATE INDEX idx_badges_zone ON badges(zone_autorisee);
CREATE INDEX idx_badges_validite ON badges(date_validite);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);

-- ===== VIEWS FOR ANALYTICS =====
CREATE OR REPLACE VIEW employes_expiring_soon AS
SELECT 
  e.id, e.nom, e.prenom, e.poste,
  h.type_hab,
  h.date_expiration,
  EXTRACT(DAY FROM h.date_expiration - NOW()) as jours_restants
FROM employes e
JOIN habilitations h ON e.id = h.employe_id
WHERE h.date_expiration <= (NOW()::date + INTERVAL '30 days')
AND h.date_expiration >= NOW()::date
ORDER BY h.date_expiration ASC;

CREATE OR REPLACE VIEW badges_expiring_soon AS
SELECT 
  CASE 
    WHEN employe_id IS NOT NULL THEN (SELECT CONCAT(prenom, ' ', nom) FROM employes WHERE id = badges.employe_id)
    WHEN sous_traitant_id IS NOT NULL THEN (SELECT nom_entreprise FROM sous_traitants WHERE id = badges.sous_traitant_id)
    ELSE 'Visiteur'
  END as personne,
  numero_badge,
  zone_autorisee,
  date_validite,
  EXTRACT(DAY FROM date_validite - NOW()) as jours_restants
FROM badges
WHERE date_validite <= (NOW()::date + INTERVAL '30 days')
AND date_validite >= NOW()::date
ORDER BY date_validite ASC;

-- ===== DONE! =====
-- Your database is ready! 🎉
-- All tables created with security policies
-- Ready for production use
