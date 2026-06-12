ALTER TABLE pregunta
    ADD COLUMN peso_puntos NUMERIC(10, 2);

ALTER TABLE opcion
    ADD COLUMN porcentaje_credito NUMERIC(5, 2);

ALTER TABLE intento
    ADD COLUMN puntos_obtenidos NUMERIC(10, 2),
    ADD COLUMN puntos_maximos NUMERIC(10, 2),
    ADD COLUMN nota_final NUMERIC(3, 2);

CREATE INDEX idx_pregunta_peso_puntos ON pregunta(peso_puntos)
    WHERE peso_puntos IS NOT NULL;
