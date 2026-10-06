CREATE TABLE attachments (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255),
    content_type VARCHAR(100),
    storage_path VARCHAR(1000),
    size_of_file BIGINT,
    cloudinary_id VARCHAR(255),
    work_order_id BIGINT REFERENCES work_orders(id),
    uploaded_at TIMESTAMP NOT NULL DEFAULT now()
);