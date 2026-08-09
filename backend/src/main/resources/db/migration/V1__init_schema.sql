CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(150),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE sites (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE work_orders (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    sla_due_at TIMESTAMP,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    site_id BIGINT NOT NULL REFERENCES sites(id),
    assigned_to BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE work_order_status_history (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id),
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by BIGINT REFERENCES users(id),
    changed_at TIMESTAMP NOT NULL DEFAULT now(),
    note TEXT
);

CREATE TABLE parts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock_qty INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE part_usage (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id),
    part_id BIGINT NOT NULL REFERENCES parts(id),
    qty_used INTEGER NOT NULL
);

CREATE TABLE time_logs (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id),
    technician_id BIGINT NOT NULL REFERENCES users(id),
    minutes INTEGER NOT NULL,
    note TEXT,
    logged_at TIMESTAMP NOT NULL DEFAULT now()
);