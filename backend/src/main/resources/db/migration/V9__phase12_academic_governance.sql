INSERT INTO rol (nombre, descripcion) VALUES
    ('DOCENTE_ADMIN', 'Docente administrador del repositorio clinico');

ALTER TABLE caso
    ADD COLUMN creador_id BIGINT REFERENCES usuario(id);

UPDATE caso
SET creador_id = (SELECT id FROM usuario WHERE correo = 'docente@agora.com')
WHERE creador_id IS NULL;

CREATE TABLE resultado_aprendizaje (
    id BIGSERIAL PRIMARY KEY,
    caso_id BIGINT NOT NULL REFERENCES caso(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_rda_caso_orden UNIQUE (caso_id, orden)
);

CREATE INDEX idx_rda_caso_id ON resultado_aprendizaje(caso_id);
CREATE INDEX idx_caso_creador_id ON caso(creador_id);

INSERT INTO usuario (rol_id, nombre, apellido, correo, password_hash)
SELECT id, 'Docente', 'Admin', 'docente_admin@agora.com', '$2y$12$ozAc9MvZ3htxg/JThcU9de37jDvAb1DxfduiMIpSH6HkQlJamQHD.'
FROM rol WHERE nombre = 'DOCENTE_ADMIN';

INSERT INTO herramienta (nombre, descripcion, tipo) VALUES
    ('Escala de ansiedad', 'Instrumento breve de screening emocional', 'EVALUACION'),
    ('Genograma', 'Mapa relacional para exploracion familiar', 'HERRAMIENTA');

INSERT INTO entidad_institucional (nombre, tipo, descripcion) VALUES
    ('Bienestar universitario', 'SERVICIO', 'Atencion psicologica institucional'),
    ('Red de apoyo estudiantil', 'RED', 'Derivacion y contencion academica');
