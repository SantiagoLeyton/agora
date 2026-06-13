-- CM4: limpieza de casos demo, cursos demo y casos realistas de Psicologia Social

UPDATE caso
SET activo = FALSE
WHERE titulo <> 'Caso juego social PSICOLOGIA SOCIAL';

CREATE OR REPLACE FUNCTION _cm4_seed_option_bundle(
    p_pregunta_id BIGINT,
    p_texto VARCHAR(500),
    p_orden INTEGER,
    p_credito NUMERIC(5, 2),
    p_mensaje VARCHAR(1000),
    p_observacion VARCHAR(2000)
) RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_opcion_id BIGINT;
    v_consecuencia_id BIGINT;
BEGIN
    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (p_pregunta_id, p_texto, 'Opcion de intervencion psicosocial', p_orden, TRUE, p_credito)
    RETURNING id INTO v_opcion_id;

    INSERT INTO consecuencia (opcion_id, mensaje, descripcion, observacion_pedagogica)
    VALUES (
        v_opcion_id,
        p_mensaje,
        'Impacto clinico-social derivado de la decision tomada.',
        p_observacion
    )
    RETURNING id INTO v_consecuencia_id;

    INSERT INTO consecuencia_estado (consecuencia_id, estado_emocional_id, variacion)
    SELECT v_consecuencia_id, ee.id, CASE ee.nombre
        WHEN 'CONFIANZA' THEN 8
        WHEN 'COOPERACION' THEN 6
        WHEN 'ANSIEDAD' THEN -5
        WHEN 'ESTRES' THEN -4
        ELSE 3
    END
    FROM estado_emocional ee
    WHERE ee.nombre IN ('CONFIANZA', 'COOPERACION', 'ANSIEDAD')
    ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION _cm4_seed_social_case(
    p_titulo VARCHAR(200),
    p_descripcion VARCHAR(2000),
    p_objetivo VARCHAR(1000),
    p_creador_id BIGINT
) RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_caso_id BIGINT;
    v_rda_id BIGINT;
    v_escena_id BIGINT;
    v_pregunta_id BIGINT;
    s INTEGER;
    q INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM caso WHERE titulo = p_titulo) THEN
        SELECT id INTO v_caso_id FROM caso WHERE titulo = p_titulo;
        RETURN v_caso_id;
    END IF;

    INSERT INTO caso (titulo, descripcion, objetivo, nivel_dificultad, duracion_estimada, activo, creador_id)
    VALUES (p_titulo, p_descripcion, p_objetivo, 'AVANZADO', 75, TRUE, p_creador_id)
    RETURNING id INTO v_caso_id;

    INSERT INTO resultado_aprendizaje (caso_id, orden, descripcion)
    VALUES (v_caso_id, 1, 'Analizar dinamicas psicosociales del contexto comunitario.')
    RETURNING id INTO v_rda_id;

    INSERT INTO resultado_aprendizaje (caso_id, orden, descripcion)
    VALUES (v_caso_id, 2, 'Disenar intervenciones basadas en evidencia y enfoque de derechos.');

    FOR s IN 1..3 LOOP
        INSERT INTO escena (caso_id, orden, titulo, descripcion, contenido, activo)
        VALUES (
            v_caso_id,
            s,
            'Escena ' || s || ': ' || p_titulo,
            'Situacion clinico-social en etapa ' || s,
            'Contexto detallado para la toma de decisiones en Psicologia Social. La comunidad presenta tensiones relacionales, factores estructurales y demanda de contencion emocional verificable.',
            TRUE
        )
        RETURNING id INTO v_escena_id;

        FOR q IN 1..2 LOOP
            INSERT INTO pregunta (escena_id, enunciado, obligatoria, activo, peso_puntos, resultado_aprendizaje_id)
            VALUES (
                v_escena_id,
                'Pregunta ' || q || ' escena ' || s || ': seleccione la intervencion psicosocial mas pertinente.',
                TRUE,
                TRUE,
                25,
                v_rda_id
            )
            RETURNING id INTO v_pregunta_id;

            PERFORM _cm4_seed_option_bundle(
                v_pregunta_id,
                'Explorar con enfoque participativo',
                1,
                100,
                'La comunidad reconoce su voz y se abre al dialogo.',
                'La participacion activa favorece legitimidad y adherencia comunitaria.'
            );
            PERFORM _cm4_seed_option_bundle(
                v_pregunta_id,
                'Imponer solucion unilateral',
                2,
                0,
                'Aparece resistencia y fragmentacion del grupo.',
                'Intervenciones impuestas suelen reforzar estigmas y desconfianza.'
            );
            PERFORM _cm4_seed_option_bundle(
                v_pregunta_id,
                'Derivar sin contencion previa',
                3,
                35,
                'Se pierde continuidad y seguimiento psicosocial.',
                'La derivacion requiere estabilizacion emocional y acuerdos claros.'
            );
        END LOOP;
    END LOOP;

    RETURN v_caso_id;
END;
$$;

DO $$
DECLARE
    v_docente_id BIGINT;
    v_docente_admin_id BIGINT;
    v_estudiante_id BIGINT;
    v_grupo_id BIGINT;
    v_caso_oficial_id BIGINT;
    v_caso1_id BIGINT;
    v_caso2_id BIGINT;
    v_caso3_id BIGINT;
BEGIN
    SELECT id INTO v_docente_id FROM usuario WHERE correo = 'docente@agora.com';
    SELECT id INTO v_docente_admin_id FROM usuario WHERE correo = 'docente_admin@agora.com';
    SELECT id INTO v_estudiante_id FROM usuario WHERE correo = 'estudiante@agora.com';

    IF v_docente_id IS NULL OR v_docente_admin_id IS NULL THEN
        RETURN;
    END IF;

    SELECT id INTO v_caso_oficial_id FROM caso WHERE titulo = 'Caso juego social PSICOLOGIA SOCIAL';

    v_caso1_id := _cm4_seed_social_case(
        'Violencia familiar y redes de apoyo comunitario',
        'Familia en barrio periferico con alertas de violencia intrafamiliar, escasa red de apoyo y riesgo de revictimizacion. El caso exige articulacion con Comisaria de Familia, lideres comunitarios y estrategias psicosociales de contencion y empoderamiento.',
        'Identificar factores de riesgo y proteccion, movilizar redes comunitarias y disenar plan psicosocial de seguridad y acompanamiento.',
        v_docente_admin_id
    );

    v_caso2_id := _cm4_seed_social_case(
        'Conflicto intergrupal en contexto escolar',
        'Institucion educativa con conflicto entre grupos estudiantiles, estigmatizacion y ciberacoso. Se evalua el clima escolar, roles de liderazgo emergente y estrategias de convivencia basadas en mediacion y psicoeducacion.',
        'Analizar dinamicas intergrupales, prevenir escalada de conflicto y proponer intervencion psicosocial institucional verificable.',
        v_docente_admin_id
    );

    v_caso3_id := _cm4_seed_social_case(
        'Intervencion psicosocial en comunidad vulnerable',
        'Comunidad afectada por desplazamiento, perdida de empleo y deterioro de cohesion social. Se trabaja con enfoque comunitario, mapeo de activos, contencion emocional y activacion de apoyos locales.',
        'Disenar intervencion psicosocial comunitaria con metas observables, enfoque de derechos y seguimiento participativo.',
        v_docente_admin_id
    );

    -- Psicologia Social I
    IF NOT EXISTS (SELECT 1 FROM grupo WHERE nombre = 'Psicologia Social I') THEN
        INSERT INTO grupo (docente_id, nombre, descripcion, periodo, clave_acceso, activo)
        VALUES (
            v_docente_id,
            'Psicologia Social I',
            'Fundamentos de Psicologia Social con simulaciones clinicas contextualizadas.',
            '2026-1',
            'PSOC-I-2026',
            TRUE
        )
        RETURNING id INTO v_grupo_id;

        IF v_estudiante_id IS NOT NULL THEN
            INSERT INTO grupo_estudiante (grupo_id, estudiante_id)
            VALUES (v_grupo_id, v_estudiante_id)
            ON CONFLICT DO NOTHING;
        END IF;

        IF v_caso_oficial_id IS NOT NULL THEN
            INSERT INTO programacion (grupo_id, docente_id, caso_id, estudiante_id, fecha_inicio, fecha_fin, activo)
            VALUES (
                v_grupo_id,
                v_docente_id,
                v_caso_oficial_id,
                NULL,
                NOW() - INTERVAL '1 day',
                NOW() + INTERVAL '120 days',
                TRUE
            );
        END IF;
    END IF;

    -- Psicologia Social II
    IF NOT EXISTS (SELECT 1 FROM grupo WHERE nombre = 'Psicologia Social II') THEN
        INSERT INTO grupo (docente_id, nombre, descripcion, periodo, clave_acceso, activo)
        VALUES (
            v_docente_id,
            'Psicologia Social II',
            'Profundizacion en intervencion psicosocial y analisis comunitario.',
            '2026-1',
            'PSOC-II-2026',
            TRUE
        )
        RETURNING id INTO v_grupo_id;

        INSERT INTO programacion (grupo_id, docente_id, caso_id, estudiante_id, fecha_inicio, fecha_fin, activo)
        VALUES (
            v_grupo_id,
            v_docente_id,
            v_caso1_id,
            NULL,
            NOW() - INTERVAL '1 day',
            NOW() + INTERVAL '120 days',
            TRUE
        );
    END IF;

    -- Psicologia Clinica
    IF NOT EXISTS (SELECT 1 FROM grupo WHERE nombre = 'Psicologia Clinica') THEN
        INSERT INTO grupo (docente_id, nombre, descripcion, periodo, clave_acceso, activo)
        VALUES (
            v_docente_id,
            'Psicologia Clinica',
            'Practicas clinicas integradas con casos simulados de evaluacion e intervencion.',
            '2026-1',
            'PCLI-2026',
            TRUE
        );
    END IF;

    -- Intervencion Psicosocial Comunitaria
    IF NOT EXISTS (SELECT 1 FROM grupo WHERE nombre = 'Intervencion Psicosocial Comunitaria') THEN
        INSERT INTO grupo (docente_id, nombre, descripcion, periodo, clave_acceso, activo)
        VALUES (
            v_docente_id,
            'Intervencion Psicosocial Comunitaria',
            'Diseno e implementacion de intervenciones comunitarias con enfoque de derechos.',
            '2026-1',
            'IPCO-2026',
            TRUE
        )
        RETURNING id INTO v_grupo_id;

        INSERT INTO programacion (grupo_id, docente_id, caso_id, estudiante_id, fecha_inicio, fecha_fin, activo)
        VALUES (
            v_grupo_id,
            v_docente_id,
            v_caso3_id,
            NULL,
            NOW() - INTERVAL '1 day',
            NOW() + INTERVAL '120 days',
            TRUE
        );
    END IF;

    -- Evaluacion y Diagnostico Psicologico
    IF NOT EXISTS (SELECT 1 FROM grupo WHERE nombre = 'Evaluacion y Diagnostico Psicologico') THEN
        INSERT INTO grupo (docente_id, nombre, descripcion, periodo, clave_acceso, activo)
        VALUES (
            v_docente_admin_id,
            'Evaluacion y Diagnostico Psicologico',
            'Competencias de evaluacion psicologica con casos simulados de alta complejidad.',
            '2026-1',
            'EDPX-2026',
            TRUE
        )
        RETURNING id INTO v_grupo_id;

        INSERT INTO programacion (grupo_id, docente_id, caso_id, estudiante_id, fecha_inicio, fecha_fin, activo)
        VALUES (
            v_grupo_id,
            v_docente_admin_id,
            v_caso2_id,
            NULL,
            NOW() - INTERVAL '1 day',
            NOW() + INTERVAL '120 days',
            FALSE
        );
    END IF;
END $$;

DROP FUNCTION IF EXISTS _cm4_seed_option_bundle(BIGINT, VARCHAR, INTEGER, NUMERIC, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS _cm4_seed_social_case(VARCHAR, VARCHAR, VARCHAR, BIGINT);
