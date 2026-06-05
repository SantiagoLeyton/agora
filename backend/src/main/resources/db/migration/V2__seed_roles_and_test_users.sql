INSERT INTO rol (nombre, descripcion) VALUES
    ('ESTUDIANTE', 'Estudiante de la plataforma Agora'),
    ('DOCENTE', 'Docente responsable de actividades academicas'),
    ('ADMINISTRADOR', 'Administrador de la plataforma');

INSERT INTO usuario (rol_id, nombre, apellido, correo, password_hash)
SELECT id, 'Admin', 'Agora', 'admin@agora.com', '$2y$12$ozAc9MvZ3htxg/JThcU9de37jDvAb1DxfduiMIpSH6HkQlJamQHD.'
FROM rol WHERE nombre = 'ADMINISTRADOR';

INSERT INTO usuario (rol_id, nombre, apellido, correo, password_hash)
SELECT id, 'Docente', 'Agora', 'docente@agora.com', '$2y$12$ozAc9MvZ3htxg/JThcU9de37jDvAb1DxfduiMIpSH6HkQlJamQHD.'
FROM rol WHERE nombre = 'DOCENTE';

INSERT INTO usuario (rol_id, nombre, apellido, correo, password_hash)
SELECT id, 'Estudiante', 'Agora', 'estudiante@agora.com', '$2y$12$ozAc9MvZ3htxg/JThcU9de37jDvAb1DxfduiMIpSH6HkQlJamQHD.'
FROM rol WHERE nombre = 'ESTUDIANTE';

