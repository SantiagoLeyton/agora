CREATE TABLE estado_emocional (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(1000),
    valor_minimo INTEGER NOT NULL,
    valor_maximo INTEGER NOT NULL,
    valor_inicial INTEGER NOT NULL,
    CONSTRAINT chk_estado_emocional_rango CHECK (valor_minimo <= valor_inicial AND valor_inicial <= valor_maximo)
);

CREATE TABLE consecuencia (
    id BIGSERIAL PRIMARY KEY,
    opcion_id BIGINT NOT NULL REFERENCES opcion(id),
    descripcion VARCHAR(1000),
    mensaje VARCHAR(1000)
);

CREATE TABLE consecuencia_estado (
    consecuencia_id BIGINT NOT NULL REFERENCES consecuencia(id) ON DELETE CASCADE,
    estado_emocional_id BIGINT NOT NULL REFERENCES estado_emocional(id),
    variacion INTEGER NOT NULL,
    PRIMARY KEY (consecuencia_id, estado_emocional_id)
);

CREATE TABLE intento (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES usuario(id),
    caso_id BIGINT NOT NULL REFERENCES caso(id),
    programacion_id BIGINT REFERENCES programacion(id),
    fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ,
    estado VARCHAR(30) NOT NULL,
    CONSTRAINT chk_intento_estado CHECK (estado IN ('EN_PROCESO', 'FINALIZADO', 'ABANDONADO'))
);

CREATE TABLE respuesta (
    id BIGSERIAL PRIMARY KEY,
    intento_id BIGINT NOT NULL REFERENCES intento(id) ON DELETE CASCADE,
    pregunta_id BIGINT NOT NULL REFERENCES pregunta(id),
    opcion_id BIGINT NOT NULL REFERENCES opcion(id),
    fecha_respuesta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_respuesta_intento_pregunta UNIQUE (intento_id, pregunta_id)
);

CREATE TABLE estado_intento (
    id BIGSERIAL PRIMARY KEY,
    intento_id BIGINT NOT NULL REFERENCES intento(id) ON DELETE CASCADE,
    estado_emocional_id BIGINT NOT NULL REFERENCES estado_emocional(id),
    valor_actual INTEGER NOT NULL,
    ultima_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_estado_intento UNIQUE (intento_id, estado_emocional_id)
);

CREATE INDEX idx_consecuencia_opcion ON consecuencia(opcion_id);
CREATE INDEX idx_consecuencia_estado_estado ON consecuencia_estado(estado_emocional_id);
CREATE INDEX idx_intento_estudiante ON intento(estudiante_id);
CREATE INDEX idx_intento_caso ON intento(caso_id);
CREATE INDEX idx_intento_programacion ON intento(programacion_id);
CREATE INDEX idx_respuesta_intento ON respuesta(intento_id);
CREATE INDEX idx_respuesta_pregunta ON respuesta(pregunta_id);
CREATE INDEX idx_estado_intento_intento ON estado_intento(intento_id);

INSERT INTO estado_emocional (nombre, descripcion, valor_minimo, valor_maximo, valor_inicial) VALUES
    ('ANSIEDAD', 'Nivel de ansiedad percibido durante la simulacion', 0, 100, 50),
    ('ESTRES', 'Nivel de estres generado por el entorno narrativo', 0, 100, 40),
    ('CONFIANZA', 'Nivel de confianza acumulada por las decisiones', 0, 100, 50),
    ('COOPERACION', 'Nivel de cooperacion observada en el entorno', 0, 100, 50),
    ('RESISTENCIA', 'Nivel de resistencia ante la intervencion', 0, 100, 30);
