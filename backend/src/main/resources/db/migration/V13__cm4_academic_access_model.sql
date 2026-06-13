-- CM4: clave de acceso, docentes co-asignados (max 2), soporte academico

ALTER TABLE grupo ADD COLUMN IF NOT EXISTS clave_acceso VARCHAR(32);

UPDATE grupo
SET clave_acceso = 'AGORA-' || LPAD(id::text, 4, '0')
WHERE clave_acceso IS NULL;

ALTER TABLE grupo ALTER COLUMN clave_acceso SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_grupo_clave_acceso ON grupo (clave_acceso);

CREATE TABLE IF NOT EXISTS grupo_docente (
    grupo_id BIGINT NOT NULL REFERENCES grupo (id) ON DELETE CASCADE,
    docente_id BIGINT NOT NULL REFERENCES usuario (id),
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (grupo_id, docente_id)
);

CREATE INDEX IF NOT EXISTS idx_grupo_docente_docente ON grupo_docente (docente_id);
