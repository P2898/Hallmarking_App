CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  company_name VARCHAR NOT NULL,
  user_type VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  status VARCHAR DEFAULT 'pending',
  fcm_token VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR NOT NULL,
  brand VARCHAR NOT NULL,
  year_of_purchase INT NOT NULL,
  condition VARCHAR NOT NULL,
  condition_description TEXT,
  pricing_type VARCHAR NOT NULL,
  price DECIMAL,
  city VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
