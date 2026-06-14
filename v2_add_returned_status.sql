-- Migration script to optimize queries for Admin reports and PDF invoice generation
-- Add indexes on frequently filtered columns in parcels table

CREATE INDEX idx_parcels_status ON parcels(status);
CREATE INDEX idx_parcels_created_at ON parcels(created_at);
CREATE INDEX idx_parcels_client_id ON parcels(client_id);
CREATE INDEX idx_parcels_driver_id ON parcels(driver_id);
