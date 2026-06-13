ALTER TABLE programacion
    ADD COLUMN estudiante_id BIGINT REFERENCES usuario(id);

CREATE INDEX idx_programacion_estudiante ON programacion(estudiante_id);

CREATE TABLE password_reset_token (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    token VARCHAR(128) NOT NULL UNIQUE,
    expira_en TIMESTAMPTZ NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_token_usuario ON password_reset_token(usuario_id);
CREATE INDEX idx_password_reset_token_token ON password_reset_token(token);
