CREATE TABLE sintesis_ia (
    id BIGSERIAL PRIMARY KEY,
    intento_id BIGINT NOT NULL REFERENCES intento(id) ON DELETE CASCADE,
    prompt_utilizado TEXT NOT NULL,
    respuesta_generada TEXT NOT NULL,
    modelo_utilizado VARCHAR(100) NOT NULL,
    fue_exitosa BOOLEAN NOT NULL,
    mensaje_error TEXT,
    fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sintesis_ia_intento ON sintesis_ia(intento_id);
CREATE INDEX idx_sintesis_ia_fecha_generacion ON sintesis_ia(fecha_generacion);
