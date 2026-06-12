ALTER TABLE pregunta
    ADD COLUMN resultado_aprendizaje_id BIGINT REFERENCES resultado_aprendizaje(id);

CREATE INDEX idx_pregunta_resultado_aprendizaje ON pregunta(resultado_aprendizaje_id);

UPDATE pregunta p
SET resultado_aprendizaje_id = sub.rda_id
FROM (
    SELECT p2.id AS pregunta_id,
           (
               SELECT r.id
               FROM resultado_aprendizaje r
               JOIN escena e2 ON e2.caso_id = r.caso_id
               WHERE e2.id = p2.escena_id
               ORDER BY r.orden ASC
               LIMIT 1
           ) AS rda_id
    FROM pregunta p2
    WHERE p2.resultado_aprendizaje_id IS NULL
      AND p2.peso_puntos IS NOT NULL
      AND p2.peso_puntos > 0
) sub
WHERE p.id = sub.pregunta_id
  AND sub.rda_id IS NOT NULL;

DO $$
DECLARE
    v_docente_id BIGINT;
    v_estudiante_id BIGINT;
    v_caso_id BIGINT;
    v_rda1_id BIGINT;
    v_rda2_id BIGINT;
    v_escena_id BIGINT;
    v_pregunta1_id BIGINT;
    v_pregunta2_id BIGINT;
    v_opcion1_id BIGINT;
    v_opcion2_id BIGINT;
    v_opcion3_id BIGINT;
    v_opcion4_id BIGINT;
    v_grupo_id BIGINT;
    v_programacion_id BIGINT;
    v_intento1_id BIGINT;
    v_intento2_id BIGINT;
    v_intento3_id BIGINT;
BEGIN
    SELECT id INTO v_docente_id FROM usuario WHERE correo = 'docente@agora.com';
    SELECT id INTO v_estudiante_id FROM usuario WHERE correo = 'estudiante@agora.com';

    IF v_docente_id IS NULL OR v_estudiante_id IS NULL THEN
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM caso WHERE titulo = 'Caso Demo Presentacion Agora') THEN
        RETURN;
    END IF;

    INSERT INTO caso (titulo, descripcion, objetivo, nivel_dificultad, duracion_estimada, activo, creador_id)
    VALUES (
        'Caso Demo Presentacion Agora',
        'Caso de demostracion para presentacion academica con evaluacion por RDA.',
        'Complemento pedagogico',
        'INTERMEDIO',
        45,
        TRUE,
        (SELECT id FROM usuario WHERE correo = 'docente_admin@agora.com' LIMIT 1)
    )
    RETURNING id INTO v_caso_id;

    INSERT INTO resultado_aprendizaje (caso_id, orden, descripcion)
    VALUES (v_caso_id, 1, 'Identificar factores de riesgo suicida')
    RETURNING id INTO v_rda1_id;

    INSERT INTO resultado_aprendizaje (caso_id, orden, descripcion)
    VALUES (v_caso_id, 2, 'Aplicar escucha activa')
    RETURNING id INTO v_rda2_id;

    INSERT INTO escena (caso_id, orden, titulo, descripcion, contenido, activo)
    VALUES (
        v_caso_id,
        1,
        'Primera consulta',
        'Consultorio universitario',
        'Paciente de 20 anos refiere angustia y pensamientos recurrentes.',
        TRUE
    )
    RETURNING id INTO v_escena_id;

    INSERT INTO pregunta (escena_id, enunciado, obligatoria, activo, peso_puntos, resultado_aprendizaje_id)
    VALUES (v_escena_id, 'Como explorarias el riesgo suicida?', TRUE, TRUE, 2.0, v_rda1_id)
    RETURNING id INTO v_pregunta1_id;

    INSERT INTO pregunta (escena_id, enunciado, obligatoria, activo, peso_puntos, resultado_aprendizaje_id)
    VALUES (v_escena_id, 'Que intervencion inicial aplicarias?', TRUE, TRUE, 2.0, v_rda2_id)
    RETURNING id INTO v_pregunta2_id;

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (v_pregunta1_id, 'Explorar pensamientos', 'Exploracion directa', 1, TRUE, 100)
    RETURNING id INTO v_opcion1_id;

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (v_pregunta1_id, 'Minimizar el riesgo', 'Evitar el tema', 2, TRUE, 0)
    RETURNING id INTO v_opcion2_id;

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (v_pregunta2_id, 'Validar emociones', 'Escucha activa', 1, TRUE, 100)
    RETURNING id INTO v_opcion3_id;

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (v_pregunta2_id, 'Dar consejos inmediatos', 'Intervencion prematura', 2, TRUE, 25)
    RETURNING id INTO v_opcion4_id;

    INSERT INTO grupo (docente_id, nombre, descripcion, periodo, activo)
    VALUES (v_docente_id, 'Grupo Demo Presentacion 2026-1', 'Grupo de demostracion Fase 13', '2026-1', TRUE)
    RETURNING id INTO v_grupo_id;

    INSERT INTO grupo_estudiante (grupo_id, estudiante_id)
    VALUES (v_grupo_id, v_estudiante_id)
    ON CONFLICT DO NOTHING;

    INSERT INTO programacion (grupo_id, caso_id, docente_id, fecha_inicio, fecha_fin, activo)
    VALUES (
        v_grupo_id,
        v_caso_id,
        v_docente_id,
        NOW() - INTERVAL '14 days',
        NOW() + INTERVAL '30 days',
        TRUE
    )
    RETURNING id INTO v_programacion_id;

    INSERT INTO intento (estudiante_id, caso_id, programacion_id, fecha_inicio, fecha_fin, estado, puntos_obtenidos, puntos_maximos, nota_final)
    VALUES (
        v_estudiante_id, v_caso_id, v_programacion_id,
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '35 minutes',
        'FINALIZADO', 2.5, 4.0, 3.13
    )
    RETURNING id INTO v_intento1_id;

    INSERT INTO intento (estudiante_id, caso_id, programacion_id, fecha_inicio, fecha_fin, estado, puntos_obtenidos, puntos_maximos, nota_final)
    VALUES (
        v_estudiante_id, v_caso_id, v_programacion_id,
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '40 minutes',
        'FINALIZADO', 3.5, 4.0, 4.38
    )
    RETURNING id INTO v_intento2_id;

    INSERT INTO intento (estudiante_id, caso_id, programacion_id, fecha_inicio, fecha_fin, estado, puntos_obtenidos, puntos_maximos, nota_final)
    VALUES (
        v_estudiante_id, v_caso_id, v_programacion_id,
        NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '38 minutes',
        'FINALIZADO', 4.0, 4.0, 5.0
    )
    RETURNING id INTO v_intento3_id;

    INSERT INTO respuesta (intento_id, pregunta_id, opcion_id, fecha_respuesta) VALUES
        (v_intento1_id, v_pregunta1_id, v_opcion1_id, NOW() - INTERVAL '10 days'),
        (v_intento1_id, v_pregunta2_id, v_opcion4_id, NOW() - INTERVAL '10 days'),
        (v_intento2_id, v_pregunta1_id, v_opcion1_id, NOW() - INTERVAL '5 days'),
        (v_intento2_id, v_pregunta2_id, v_opcion3_id, NOW() - INTERVAL '5 days'),
        (v_intento3_id, v_pregunta1_id, v_opcion1_id, NOW() - INTERVAL '1 day'),
        (v_intento3_id, v_pregunta2_id, v_opcion3_id, NOW() - INTERVAL '1 day');

    INSERT INTO estado_intento (intento_id, estado_emocional_id, valor_actual, ultima_actualizacion)
    SELECT v_intento3_id, id, 55, NOW() FROM estado_emocional WHERE nombre = 'ANSIEDAD';

    INSERT INTO estado_intento (intento_id, estado_emocional_id, valor_actual, ultima_actualizacion)
    SELECT v_intento3_id, id, 72, NOW() FROM estado_emocional WHERE nombre = 'CONFIANZA';

    INSERT INTO retroalimentacion (intento_id, autor, contenido, tiempo_total, escenas_completadas, observaciones, fecha_generacion)
    VALUES
        (v_intento3_id, 'SISTEMA', 'Sesion finalizada con progreso observable en escucha activa.', 2280, 1, NULL, NOW() - INTERVAL '1 day'),
        (v_intento3_id, 'DOCENTE', 'Excelente evolucion en la exploracion del riesgo y validacion emocional.', 2280, 1, 'Mantener practica de formulacion abierta.', NOW() - INTERVAL '20 hours');

    INSERT INTO sintesis_ia (intento_id, modelo_utilizado, prompt_utilizado, respuesta_generada, fue_exitosa, mensaje_error, fecha_generacion)
    VALUES (
        v_intento3_id,
        'demo-model',
        'Resumen pedagogico de demostracion',
        'La simulacion evidencia mejora en escucha activa y exploracion de factores de riesgo. Se recomienda reforzar intervenciones iniciales basadas en validacion emocional.',
        TRUE,
        NULL,
        NOW() - INTERVAL '18 hours'
    );
END $$;
