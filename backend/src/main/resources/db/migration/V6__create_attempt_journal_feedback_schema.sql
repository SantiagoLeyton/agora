CREATE TABLE bitacora (
    id BIGSERIAL PRIMARY KEY,
    intento_id BIGINT NOT NULL REFERENCES intento(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE retroalimentacion (
    id BIGSERIAL PRIMARY KEY,
    intento_id BIGINT NOT NULL REFERENCES intento(id) ON DELETE CASCADE,
    autor VARCHAR(30) NOT NULL,
    contenido TEXT NOT NULL,
    tiempo_total BIGINT,
    escenas_completadas INTEGER,
    observaciones TEXT,
    fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_retroalimentacion_autor CHECK (autor IN ('DOCENTE', 'SISTEMA', 'IA'))
);

CREATE INDEX idx_bitacora_intento ON bitacora(intento_id);
CREATE INDEX idx_retroalimentacion_intento ON retroalimentacion(intento_id);
CREATE INDEX idx_retroalimentacion_autor ON retroalimentacion(autor);
