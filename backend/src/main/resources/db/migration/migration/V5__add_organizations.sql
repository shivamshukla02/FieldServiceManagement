CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    invite_code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN organization_id BIGINT REFERENCES organizations(id);
ALTER TABLE customers ADD COLUMN organization_id BIGINT REFERENCES organizations(id);
ALTER TABLE sites ADD COLUMN organization_id BIGINT REFERENCES organizations(id);
ALTER TABLE work_orders ADD COLUMN organization_id BIGINT REFERENCES organizations(id);