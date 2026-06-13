-- CM2: consecuencias clinicas, observacion pedagogica y caso oficial psicologia social

ALTER TABLE consecuencia
    ADD COLUMN IF NOT EXISTS observacion_pedagogica VARCHAR(2000);

CREATE OR REPLACE FUNCTION _v12_consecuencia_bundle(
    p_opcion_id BIGINT,
    p_mensaje VARCHAR(1000),
    p_descripcion VARCHAR(1000),
    p_observacion VARCHAR(2000),
    p_estados TEXT[],
    p_variaciones INTEGER[]
) RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_consecuencia_id BIGINT;
    v_estado_id BIGINT;
    i INTEGER;
BEGIN
    IF p_opcion_id IS NULL THEN
        RETURN;
    END IF;
    IF EXISTS (SELECT 1 FROM consecuencia WHERE opcion_id = p_opcion_id) THEN
        RETURN;
    END IF;
    INSERT INTO consecuencia (opcion_id, mensaje, descripcion, observacion_pedagogica)
    VALUES (p_opcion_id, p_mensaje, p_descripcion, p_observacion)
    RETURNING id INTO v_consecuencia_id;
    IF p_estados IS NULL OR p_variaciones IS NULL THEN
        RETURN;
    END IF;
    FOR i IN 1 .. array_length(p_estados, 1) LOOP
        SELECT id INTO v_estado_id FROM estado_emocional WHERE nombre = p_estados[i];
        IF v_estado_id IS NOT NULL THEN
            INSERT INTO consecuencia_estado (consecuencia_id, estado_emocional_id, variacion)
            VALUES (v_consecuencia_id, v_estado_id, p_variaciones[i])
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END;
$$;

DO $$
DECLARE
    v_opcion RECORD;
BEGIN
    FOR v_opcion IN
        SELECT o.id, o.texto
        FROM opcion o
        JOIN pregunta p ON p.id = o.pregunta_id
        JOIN escena e ON e.id = p.escena_id
        JOIN caso c ON c.id = e.caso_id
        WHERE c.titulo = 'Caso Demo Presentacion Agora'
        ORDER BY o.id
    LOOP
        CASE v_opcion.texto
            WHEN 'Explorar pensamientos' THEN
                PERFORM _v12_consecuencia_bundle(
                    v_opcion.id,
                    'El paciente reconoce pensamientos y acepta continuar la entrevista.',
                    'Se profundiza en ideacion sin normalizar ni alarmar; se evalua plan de seguridad.',
                    'La exploracion gradual del riesgo suicida es competencia central en simulacion clinica inicial.',
                    ARRAY['ANSIEDAD','CONFIANZA','COOPERACION'],
                    ARRAY[5,10,6]
                );
            WHEN 'Minimizar el riesgo' THEN
                PERFORM _v12_consecuencia_bundle(
                    v_opcion.id,
                    'El paciente cierra la comunicacion y minimiza sintomas en turnos siguientes.',
                    'Evitar el tema incrementa aislamiento y subregistro de riesgo.',
                    'La evitacion del contenido suicida puede interpretarse como invalidacion; use preguntas directas con empatia.',
                    ARRAY['ANSIEDAD','CONFIANZA','RESISTENCIA'],
                    ARRAY[8,-12,10]
                );
            WHEN 'Validar emociones' THEN
                PERFORM _v12_consecuencia_bundle(
                    v_opcion.id,
                    'El paciente llora, se calma y describe mejor su experiencia emocional.',
                    'La validacion facilita alianza y prepara intervenciones posteriores.',
                    'Diferencie validacion de resignacion; valide emocion y explore necesidades.',
                    ARRAY['ANSIEDAD','ESTRES','CONFIANZA'],
                    ARRAY[-12,-8,14]
                );
            WHEN 'Dar consejos inmediatos' THEN
                PERFORM _v12_consecuencia_bundle(
                    v_opcion.id,
                    'El paciente asiente cortesmente pero no sigue las recomendaciones.',
                    'Consejos prematuros sin exploracion reducen adherencia.',
                    'Priorice formulacion colaborativa de pasos tras explorar significado del malestar.',
                    ARRAY['CONFIANZA','COOPERACION','RESISTENCIA'],
                    ARRAY[-6,-5,7]
                );
            ELSE NULL;
        END CASE;
    END LOOP;
END $$;

DO $$
DECLARE
    v_docente_id BIGINT;
    v_estudiante_id BIGINT;
    v_autor_id BIGINT;
    v_caso_id BIGINT;
    v_grupo_id BIGINT;
    v_programacion_id BIGINT;
    v_rda_ids BIGINT[] := ARRAY[]::BIGINT[];
    v_escena_id BIGINT;
    v_pregunta_id BIGINT;
    v_opcion_id BIGINT;
    v_rda_id BIGINT;
    i INTEGER;
BEGIN
    SELECT id INTO v_docente_id FROM usuario WHERE correo = 'docente@agora.com';
    SELECT id INTO v_estudiante_id FROM usuario WHERE correo = 'estudiante@agora.com';
    SELECT id INTO v_autor_id FROM usuario WHERE correo = 'docente_admin@agora.com';

    IF v_docente_id IS NULL OR v_estudiante_id IS NULL OR v_autor_id IS NULL THEN
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM caso WHERE titulo = 'Caso juego social PSICOLOGIA SOCIAL') THEN
        RETURN;
    END IF;

    INSERT INTO caso (titulo, descripcion, objetivo, nivel_dificultad, duracion_estimada, activo, creador_id)
    VALUES (
        'Caso juego social PSICOLOGIA SOCIAL',
        'Simulacion clinico-pedagogica sobre intervencion psicosocial con enfoque en juego social en un nino de 9 anos matriculado en una institucion educativa oficial de Colombia. El caso integra observacion en contexto escolar, entrevista con red de cuidado y diseno de estrategias basadas en juego cooperativo. Se articula el marco normativo de la Ley 1098 de 2006 (Codigo de la Infancia y la Adolescencia), los principios de garantia de derechos, la ruta de atencion del ICBF cuando hay alertas de vulneracion, y el rol del equipo de orientacion escolar en la deteccion temprana de dificultades relacionales.',
        'Desarrollar competencias de intervencion psicosocial en juego social: analizar conductas ludicas como indicadores de desarrollo socioafectivo, aplicar el enfoque de derechos del NNA segun Ley 1098/2006, disenar acciones psicoeducativas en el patio y el aula, y coordinar con familia, docentes e ICBF en un plan de seguimiento escolar verificable.',
        'AVANZADO',
        90,
        TRUE,
        v_autor_id
    )
    RETURNING id INTO v_caso_id;

    INSERT INTO resultado_aprendizaje (caso_id, orden, descripcion)
    VALUES (v_caso_id, 1, 'Analizar el juego social como ventana de evaluacion del desarrollo psicosocial en el contexto escolar colombiano.')
    RETURNING id INTO v_rda_id;
    v_rda_ids := array_append(v_rda_ids, v_rda_id);

    INSERT INTO resultado_aprendizaje (caso_id, orden, descripcion)
    VALUES (v_caso_id, 2, 'Aplicar el enfoque de garantia de derechos del NNA conforme a la Ley 1098/2006 y protocolos institucionales.')
    RETURNING id INTO v_rda_id;
    v_rda_ids := array_append(v_rda_ids, v_rda_id);

    INSERT INTO resultado_aprendizaje (caso_id, orden, descripcion)
    VALUES (v_caso_id, 3, 'Disenar intervenciones psicosociales basadas en juego estructurado y cooperativo con metas observables.')
    RETURNING id INTO v_rda_id;
    v_rda_ids := array_append(v_rda_ids, v_rda_id);

    INSERT INTO resultado_aprendizaje (caso_id, orden, descripcion)
    VALUES (v_caso_id, 4, 'Articular la intervencion con la red institucional: colegio, familia y ICBF en escenarios de alerta.')
    RETURNING id INTO v_rda_id;
    v_rda_ids := array_append(v_rda_ids, v_rda_id);

    INSERT INTO escena (caso_id, orden, titulo, descripcion, contenido, activo)
    VALUES (
        v_caso_id, 1, 'Derivacion y primera entrevista en orientacion escolar', 'Colegio distrital, semana 3 del periodo academico.', 'La orientadora escolar recibe a Tomas, nino de 9 anos de cuarto de primaria, derivado por la docente de aula porque en actividades ludicas se retira del grupo, monopoliza materiales o interrumpe las reglas del juego. La madre trabajadora reporta cambios recientes tras la llegada de un hermano menor. En la ficha institucional no hay reporte previo a Comite de Convivencia. Usted acompana como practicante de Psicologia Social bajo supervision. Debe registrar hipotesis psicosociales sin estigmatizar, explicar el proposito educativo de la entrevista y establecer un contrato de confidencialidad acorde al reglamento escolar y a la Ley 1098 de 2006, que reconoce al NNA como sujeto de derechos. La sala tiene juegos de mesa, cronometro y formato de observacion del ICBF adaptado al contexto educativo preventivo.', TRUE
    )
    RETURNING id INTO v_escena_id;

    INSERT INTO pregunta (escena_id, enunciado, obligatoria, activo, peso_puntos, resultado_aprendizaje_id)
    VALUES (
        v_escena_id, 'Ante la derivacion inicial, cual es la secuencia profesional mas adecuada para abrir el proceso con Tomas y su red de cuidado?', TRUE, TRUE, 2.0, v_rda_ids[1]
    )
    RETURNING id INTO v_pregunta_id;

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Entrevista inicial con escucha activa y acuerdo de objetivos', 'Explora motivo de consulta, expectativas y consentimiento informado escolar.', 1, TRUE, 100
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Tomas se muestra cauteloso pero permanece en la sala; la madre valida el proceso.',
        'Se abre un espacio seguro y se documenta la linea base sin etiquetar al NNA.',
        'La apertura estructurada reduce amenaza percibida y favorece alianza terapeutica inicial.',
        ARRAY['ANSIEDAD','CONFIANZA','COOPERACION'],
        ARRAY[-10,12,8]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Aplicar bateria estandarizada completa en la primera sesion', 'Prioriza medicion sin relacion previa.', 2, TRUE, 25
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Tomas se incomoda, interrumpe tareas y solicita salir; la madre se muestra confundida.',
        'Sobreexigencia evaluativa en primer contacto aumenta resistencia y sesga la observacion natural.',
        'Recuerde que la evaluacion psicosocial es un proceso; la primera sesion prioriza vinculo y contexto.',
        ARRAY['ANSIEDAD','ESTRES','RESISTENCIA'],
        ARRAY[14,10,12]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Informar a todo el equipo docente los hallazgos preliminares sin entrevistar', 'Circula informacion sin base clinica suficiente.', 3, TRUE, 0
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Circulan rumores en el curso; Tomas percibe etiquetamiento y evita el patio.',
        'Violacion de confidencialidad y posible estigma segun convivencia escolar.',
        'La Ley 1098/2006 y el debido proceso exigen resguardar la intimidad del NNA.',
        ARRAY['ANSIEDAD','CONFIANZA','RESISTENCIA'],
        ARRAY[12,-15,15]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Posponer la entrevista hasta que el docente resuelva el conflicto en el aula', 'Delega la intervencion exclusivamente al aula sin articulacion.', 4, TRUE, 15
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'El conflicto ludico se repite; la familia percibe que el colegio no responde.',
        'Se pierde oportunidad de prevencion temprana en juego social.',
        'La orientacion escolar debe coordinar, no sustituir, la intervencion psicosocial.',
        ARRAY['ESTRES','COOPERACION','RESISTENCIA'],
        ARRAY[8,-6,5]
    );

    INSERT INTO escena (caso_id, orden, titulo, descripcion, contenido, activo)
    VALUES (
        v_caso_id, 2, 'Observacion sistematica del juego en el patio', 'Recreo de 30 minutos, juego grupal con reglas explicitas.', 'Con autorizacion de la institucion y asentimiento de Tomas, usted observa desde una zona perimetral el juego de cuatro en raya en el patio. Tomas alterna turnos irregulares, reclama cuando pierde y en una ocasion empuja suavemente el tablero. Dos companeros se alejan. La docente de educacion fisica reporta que en juegos cooperativos Tomas acepta roles solo si controla el material. Registre conductas verbales y no verbales, dinamica grupal, liderazgo emergente y episodios de exclusion. Relacione los hallazgos con hipotesis de regulacion emocional, habilidades socioemocionales y posible sobrecarga familiar. Evite interpretaciones diagnosticas precipitadas; use categorias descriptivas de psicologia social del desarrollo.', TRUE
    )
    RETURNING id INTO v_escena_id;

    INSERT INTO pregunta (escena_id, enunciado, obligatoria, activo, peso_puntos, resultado_aprendizaje_id)
    VALUES (
        v_escena_id, 'Durante la observacion del juego grupal, que conducta profesional maximiza la validez ecologica de la evaluacion?', TRUE, TRUE, 2.0, v_rda_ids[1]
    )
    RETURNING id INTO v_pregunta_id;

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Registro narrativo y escala de frecuencia de conductas ludicas', 'Combina descripcion contextual con conteo de episodios clave.', 1, TRUE, 100
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Se identifican patrones de turno, protesta y reintegracion tras mediacion espontanea.',
        'La observacion estructurada en contexto natural es pilar del analisis de juego social.',
        'Vincule cada conducta observada con hipotesis psicosociales verificables en escena siguiente.',
        ARRAY['ANSIEDAD','CONFIANZA','COOPERACION'],
        ARRAY[-6,8,10]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Intervenir activamente cada conflicto para modelar resolucion', 'Altera la dinamica natural del grupo.', 2, TRUE, 30
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Los ninos modifican su conducta ante el adulto; se pierde validez ecologica.',
        'La sobreintervencion impide distinguir habilidades espontaneas de cumplimiento por presencia adulta.',
        'Diferencie observacion de intervencion; registre primero, intervenga en fase planificada.',
        ARRAY['ESTRES','COOPERACION','RESISTENCIA'],
        ARRAY[6,-8,5]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Retirar a Tomas del juego tras el primer empujon', 'Termina la observacion sin analisis de reparacion grupal.', 3, TRUE, 10
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Tomas interpreta la salida como castigo; aumenta evitacion del patio.',
        'La sancion inmediata sin analisis funcional refuerza exclusion del par.',
        'Priorice seguridad, pero mantenga analisis de antecedentes y consecuencias del juego.',
        ARRAY['ANSIEDAD','CONFIANZA','RESISTENCIA'],
        ARRAY[10,-12,11]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Grabar sin consentimiento institucional para tener evidencia', 'Incumple protocolos de proteccion de datos del NNA.', 4, TRUE, 0
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'La rectoria cuestiona el procedimiento; la familia retira el consentimiento.',
        'Riesgo etico y legal; afecta confianza en el proceso psicosocial.',
        'Use formatos escritos autorizados; la evidencia debe ser etica y pertinente.',
        ARRAY['CONFIANZA','ESTRES','RESISTENCIA'],
        ARRAY[-15,12,14]
    );

    INSERT INTO escena (caso_id, orden, titulo, descripcion, contenido, activo)
    VALUES (
        v_caso_id, 3, 'Entrevista familiar y lectura del marco normativo', 'Casa de la familia, entrevista con madre y cuidadora ocasional.', 'En visita domiciliaria acordada con la madre, se explora la historia de crianza, rutinas de juego en casa, limites y modelos de resolucion de conflictos entre hermanos. La madre manifiesta culpa por falta de tiempo y episodios de gritos cuando Tomas ''desobedece''. No hay signos actuales de maltrato fisico severo, pero si sobrecarga del cuidador y inconsistencia en consecuencias. Se revisa cuando es pertinente activar la ruta del ICBF (Defensor de Familia / comisaria de familia) segun Ley 1098 de 2006: en este momento corresponde fortalecimiento familiar y seguimiento escolar, documentando factores de proteccion (red de abuela materna, asistencia regular). Elabore un genograma simplificado y un plan de acuerdos de juego en casa alineado con estrategias del colegio.', TRUE
    )
    RETURNING id INTO v_escena_id;

    INSERT INTO pregunta (escena_id, enunciado, obligatoria, activo, peso_puntos, resultado_aprendizaje_id)
    VALUES (
        v_escena_id, 'Frente a la sobrecarga materna y tensiones en el juego entre hermanos, cual plan respeta el enfoque de derechos y prevencion del ICBF?', TRUE, TRUE, 2.0, v_rda_ids[2]
    )
    RETURNING id INTO v_pregunta_id;

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Psicoeducacion en crianza positiva y acuerdos de juego estructurado en casa', 'Fortalece factores protectores sin judicializar prematuramente.', 1, TRUE, 100
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'La madre practica turnos con cronometro; disminuyen episodios de gritos reportados.',
        'La prevencion primaria articulada escuela-hogar es coherente con politica de infancia.',
        'Documente acuerdos y derive a ruta ICBF solo si persisten alertas de vulneracion.',
        ARRAY['ESTRES','CONFIANZA','COOPERACION'],
        ARRAY[-12,10,9]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Denuncia inmediata sin plan de fortalecimiento familiar', 'Activa ruta extrema sin evidencia de vulneracion grave actual.', 2, TRUE, 20
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'La familia se retrae del acompanamiento escolar; Tomas presenta mas somatizaciones.',
        'La intervencion debe ser proporcional; la Ley 1098 exige interes superior del NNA con enfoque familiar.',
        'Diferencie alerta de riesgo inminente de factores de estrés moderados manejables.',
        ARRAY['ANSIEDAD','CONFIANZA','RESISTENCIA'],
        ARRAY[13,-14,12]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Recomendar castigo corporal leve para ''marcar limites''', 'Contradice lineamientos de proteccion integral.', 3, TRUE, 0
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Aumentan conductas de oposicion en el juego; la madre reporta culpa y llanto.',
        'Practica inaceptable; refuerza ciclo de violencia y afecta attachment.',
        'Ofrezca alternativas de disciplina positiva y regulacion co-regulada en juego.',
        ARRAY['ESTRES','CONFIANZA','RESISTENCIA'],
        ARRAY[15,-12,15]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Evitar involucrar a la familia y trabajar solo en el colegio', 'Desarticula la intervencion psicosocial del contexto de crianza.', 4, TRUE, 25
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Los avances en el patio no se sostienen en casa; recaen conductas de monopolio del juego.',
        'El juego social se aprende en multiples contextos; la familia es agente de cambio.',
        'Planifique sesiones breves de psicoeducacion con metas SMART ludicas.',
        ARRAY['COOPERACION','ESTRES','RESISTENCIA'],
        ARRAY[-10,7,6]
    );

    INSERT INTO escena (caso_id, orden, titulo, descripcion, contenido, activo)
    VALUES (
        v_caso_id, 4, 'Sesion de juego estructurado en el aula de orientacion', 'Intervencion grupal pequena con reglas visuales y roles rotativos.', 'Se implementa una sesion de juego cooperativo con tres companeros voluntarios y Tomas, con carteleras de turnos, refuerzo diferencial por comportamientos prosociales y pausas de regulacion emocional (respiracion guiada de 1 minuto). El objetivo es practicar negociacion de reglas, reparacion tras error y celebracion de logros compartidos. La orientadora co-facilita. Usted registra micro-momentos de cooperacion y usa preguntas socraticas breves al cierre: ''Que ayudo a que el juego fuera justo?''. Se alinea la sesion con el Proyecto Educativo Institucional que promueve convivencia y habilidades socioemocionales. Prepare retroalimentacion para la docente de aula sobre transito de estrategias al patio.', TRUE
    )
    RETURNING id INTO v_escena_id;

    INSERT INTO pregunta (escena_id, enunciado, obligatoria, activo, peso_puntos, resultado_aprendizaje_id)
    VALUES (
        v_escena_id, 'En la sesion de juego estructurado, que secuencia pedagogica favorece la internalizacion de cooperacion?', TRUE, TRUE, 2.0, v_rda_ids[3]
    )
    RETURNING id INTO v_pregunta_id;

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Modelado, practica guiada, feedback especifico y generalizacion al patio', 'Secuencia psicoeducativa con metas conductuales observables.', 1, TRUE, 100
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Tomas negocia un cambio de regla sin empujar el material; el grupo mantiene el juego.',
        'La practica deliberada en juego es nucleo de la intervencion psicosocial escolar.',
        'Programe ensayos conductuales sucesivos con criterios de salida claros.',
        ARRAY['ANSIEDAD','CONFIANZA','COOPERACION'],
        ARRAY[-8,11,14]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Premiar solo al ganador para motivar competitividad sana', 'Refuerza comparacion social y frustracion en Tomas.', 2, TRUE, 15
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Reaparecen conductas de monopolio; un companero abandona la sesion.',
        'El refuerzo competitivo puede perjudicar al NNA con dificultades de regulacion.',
        'Use refuerzo contingente a conductas prosociales, no solo al resultado.',
        ARRAY['ESTRES','COOPERACION','RESISTENCIA'],
        ARRAY[9,-12,8]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Eliminar reglas para que Tomas exprese libremente su frustracion', 'Confunde catharsis con aprendizaje de habilidades sociales.', 3, TRUE, 20
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'El juego se desorganiza; aumentan episodios de interrupcion sin reparacion.',
        'La estructura benevolente es necesaria en juego terapeutico escolar.',
        'Mantenga reglas simples visibles y ensene reparacion explicita.',
        ARRAY['ANSIEDAD','COOPERACION','ESTRES'],
        ARRAY[6,-7,5]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Sustituir el juego grupal por trabajo individual en hojas de colorear', 'Reduce exposicion a habilidades socioemocionales peer-to-peer.', 4, TRUE, 10
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Tomas cumple la tarea solitaria pero no transfiere habilidades al recreo.',
        'El objetivo del caso es juego social; evite evitacion prolongada del grupo.',
        'Integre actividades individuales solo como puente hacia juego grupal.',
        ARRAY['COOPERACION','CONFIANZA','RESISTENCIA'],
        ARRAY[-9,-5,4]
    );

    INSERT INTO escena (caso_id, orden, titulo, descripcion, contenido, activo)
    VALUES (
        v_caso_id, 5, 'Seguimiento, articulacion institucional y cierre del plan', 'Reunion de articulacion con docente, orientadora y madre.', 'A las tres semanas, se realiza mesa de articulacion con docente de aula, orientadora y madre. Se revisan indicadores: disminucion de reportes de conflicto en juego, aumento de invitaciones de pares, cumplimiento de acuerdos en casa. Se discute si persisten alertas que requieran remision a psicologia clinica o a ruta ICBF; por ahora se mantiene plan de nivel 1-2 de apoyo psicosocial escolar. Usted redacta informe para Comite de Convivencia con lenguaje no estigmatizante, recomendaciones para el recreo y compromisos de seguimiento mensual. El caso se cierra pedagogicamente con metas de autonomia de Tomas en la eleccion de juegos y resolucion de conflictos con apoyo minimo.', TRUE
    )
    RETURNING id INTO v_escena_id;

    INSERT INTO pregunta (escena_id, enunciado, obligatoria, activo, peso_puntos, resultado_aprendizaje_id)
    VALUES (
        v_escena_id, 'Al cerrar el proceso, cual decision de articulacion institucional consolida los aprendizajes del caso?', TRUE, TRUE, 2.0, v_rda_ids[4]
    )
    RETURNING id INTO v_pregunta_id;

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Informe integrado, plan de seguimiento y roles definidos entre escuela y familia', 'Cierra con responsabilidades claras y monitoreo de indicadores de juego social.', 1, TRUE, 100
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'El equipo acuerda reunion de control en 30 dias; Tomas participa en consejo de curso ludico.',
        'La articulacion interinstitucional evita duplicidad y abandono del plan.',
        'Incluya indicadores observables de cooperacion y canal de comunicacion docente-familia.',
        ARRAY['ESTRES','CONFIANZA','COOPERACION'],
        ARRAY[-10,13,12]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Archivar el caso sin comunicacion al Comite de Convivencia', 'Impide aprendizaje organizacional y seguimiento.', 2, TRUE, 0
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Los conflictos ludicos reaparecen sin mediacion; la familia desconoce avances.',
        'La convivencia escolar exige memoria institucional y seguimiento.',
        'El informe debe resguardar dignidad del NNA y orientar al docente.',
        ARRAY['ESTRES','CONFIANZA','RESISTENCIA'],
        ARRAY[11,-10,9]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Trasladar la responsabilidad exclusiva al ICBF sin verificar criterios de remision', 'Desarticula el primer nivel de respuesta escolar.', 3, TRUE, 20
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Demoras en atencion; Tomas percibe que ''lo sacaron del colegio'' como problema.',
        'La remision debe ser criteriada segun Ley 1098 y protocolo local.',
        'Documente intentos de intervencion escolar antes de derivacion externa.',
        ARRAY['ANSIEDAD','COOPERACION','RESISTENCIA'],
        ARRAY[8,-6,7]
    );

    INSERT INTO opcion (pregunta_id, texto, descripcion, orden, activo, porcentaje_credito)
    VALUES (
        v_pregunta_id, 'Publicar el nombre del estudiante en cartelera de avances', 'Vulnera confidencialidad y puede generar bullying.', 4, TRUE, 0
    )
    RETURNING id INTO v_opcion_id;
    PERFORM _v12_consecuencia_bundle(
        v_opcion_id,
        'Algunos companeros se burlan; Tomas rechaza actividades grupales.',
        'Proteja identidad del NNA en comunicaciones institucionales.',
        'Use informes cerrados a equipo y metas generales de convivencia para el curso.',
        ARRAY['ANSIEDAD','CONFIANZA','RESISTENCIA'],
        ARRAY[14,-15,13]
    );

    SELECT id INTO v_grupo_id FROM grupo WHERE nombre = 'Curso Psicologia Social 2026-1';
    IF v_grupo_id IS NULL THEN
        INSERT INTO grupo (docente_id, nombre, descripcion, periodo, activo)
        VALUES (
            v_docente_id,
            'Curso Psicologia Social 2026-1',
            'Curso de Psicologia Social con simulacion de intervencion en juego cooperativo',
            '2026-1',
            TRUE
        )
        RETURNING id INTO v_grupo_id;
    END IF;

    INSERT INTO grupo_estudiante (grupo_id, estudiante_id)
    VALUES (v_grupo_id, v_estudiante_id)
    ON CONFLICT DO NOTHING;

    IF NOT EXISTS (
        SELECT 1 FROM programacion
        WHERE grupo_id = v_grupo_id AND caso_id = v_caso_id AND docente_id = v_docente_id
    ) THEN
        INSERT INTO programacion (grupo_id, caso_id, docente_id, estudiante_id, fecha_inicio, fecha_fin, activo)
        VALUES (
            v_grupo_id,
            v_caso_id,
            v_docente_id,
            v_estudiante_id,
            NOW(),
            NOW() + INTERVAL '60 days',
            TRUE
        );
    END IF;
END $$;

DROP FUNCTION IF EXISTS _v12_consecuencia_bundle(BIGINT, VARCHAR, VARCHAR, VARCHAR, TEXT[], INTEGER[]);
