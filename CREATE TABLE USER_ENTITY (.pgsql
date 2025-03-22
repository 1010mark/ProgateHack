CREATE TABLE USER_ENTITY (
    ID VARCHAR(36) PRIMARY KEY,
    EMAIL VARCHAR(255),
    USERNAME VARCHAR(255)
    -- 他のKeycloakの標準カラム
);

CREATE TABLE user_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL NOT NULL,
    unit VARCHAR(20) NOT NULL,
    expiration_date TIMESTAMP,
    category VARCHAR(20),
    notes TEXT,
    used_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) REFERENCES USER_ENTITY(ID),
  recipes_name VARCHAR(255) NOT NULL,
  people_count INT NOT NULL,
  meal_preference TEXT,
  cooking_time TEXT,
  allergies TEXT,
  other_conditions TEXT,
  status VARCHAR(20) NOT NULL DEFAULT '作成中' CHECK (status IN ('作成中', '完了', '失敗')),
  description TEXT,
  content TEXT, -- Markdown
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);