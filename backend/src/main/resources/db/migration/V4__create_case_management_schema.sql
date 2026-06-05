CREATE TABLE caso (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(1000),
    objetivo VARCHAR(1000),
    nivel_dificultad VARCHAR(50) NOT NULL,
    duracion_estimada INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE escena (
    id BIGSERIAL PRIMARY KEY,
    caso_id BIGINT NOT NULL REFERENCES caso(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(1000),
    contenido TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_escena_caso_orden UNIQUE (caso_id, orden)
);

CREATE TABLE pregunta (
    id BIGSERIAL PRIMARY KEY,
    escena_id BIGINT NOT NULL REFERENCES escena(id) ON DELETE CASCADE,
    enunciado VARCHAR(1000) NOT NULL,
    obligatoria BOOLEAN NOT NULL DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE opcion (
    id BIGSERIAL PRIMARY KEY,
    pregunta_id BIGINT NOT NULL REFERENCES pregunta(id) ON DELETE CASCADE,
    texto VARCHAR(500) NOT NULL,
    descripcion VARCHAR(1000),
    orden INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_opcion_pregunta_orden UNIQUE (pregunta_id, orden)
);

CREATE TABLE herramienta (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(1000),
    tipo VARCHAR(80) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE entidad_institucional (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(80) NOT NULL,
    descripcion VARCHAR(1000),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE caso_herramienta (
    caso_id BIGINT NOT NULL REFERENCES caso(id) ON DELETE CASCADE,
    herramienta_id BIGINT NOT NULL REFERENCES herramienta(id),
    PRIMARY KEY (caso_id, herramienta_id)
);

CREATE TABLE caso_entidad (
    caso_id BIGINT NOT NULL REFERENCES caso(id) ON DELETE CASCADE,
    entidad_id BIGINT NOT NULL REFERENCES entidad_institucional(id),
    PRIMARY KEY (caso_id, entidad_id)
);

CREATE INDEX idx_caso_activo ON caso(activo);
CREATE INDEX idx_escena_caso_id ON escena(caso_id);
CREATE INDEX idx_pregunta_escena_id ON pregunta(escena_id);
CREATE INDEX idx_opcion_pregunta_id ON opcion(pregunta_id);
CREATE INDEX idx_herramienta_activo ON herramienta(activo);
CREATE INDEX idx_entidad_institucional_activo ON entidad_institucional(activo);
CREATE INDEX idx_caso_herramienta_herramienta_id ON caso_herramienta(herramienta_id);
CREATE INDEX idx_caso_entidad_entidad_id ON caso_entidad(entidad_id);
