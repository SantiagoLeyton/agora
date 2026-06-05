CREATE TABLE grupo (
    id BIGSERIAL PRIMARY KEY,
    docente_id BIGINT NOT NULL REFERENCES usuario(id),
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    periodo VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grupo_estudiante (
    grupo_id BIGINT NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
    estudiante_id BIGINT NOT NULL REFERENCES usuario(id),
    fecha_ingreso TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (grupo_id, estudiante_id)
);

CREATE TABLE programacion (
    id BIGSERIAL PRIMARY KEY,
    grupo_id BIGINT NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
    docente_id BIGINT NOT NULL REFERENCES usuario(id),
    caso_id BIGINT,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_programacion_fechas CHECK (fecha_inicio < fecha_fin)
);

CREATE INDEX idx_grupo_docente_id ON grupo(docente_id);
CREATE INDEX idx_grupo_periodo ON grupo(periodo);
CREATE INDEX idx_grupo_activo ON grupo(activo);
CREATE INDEX idx_grupo_estudiante_estudiante_id ON grupo_estudiante(estudiante_id);
CREATE INDEX idx_programacion_grupo_id ON programacion(grupo_id);
CREATE INDEX idx_programacion_docente_id ON programacion(docente_id);
CREATE INDEX idx_programacion_caso_id ON programacion(caso_id);
CREATE INDEX idx_programacion_fechas ON programacion(fecha_inicio, fecha_fin);
