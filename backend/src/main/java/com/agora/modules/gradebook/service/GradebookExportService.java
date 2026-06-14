package com.agora.modules.gradebook.service;

import com.agora.modules.gradebook.dto.GradebookEntryResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GradebookExportService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ISO_INSTANT.withZone(java.time.ZoneOffset.UTC);

    public byte[] exportCsv(List<GradebookEntryResponse> rows) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (OutputStreamWriter writer = new OutputStreamWriter(output, StandardCharsets.UTF_8)) {
            writer.write("Estudiante,Correo,Curso,Caso,Nota,Estado,Fecha\n");
            for (GradebookEntryResponse row : rows) {
                writer.write(String.join(",",
                        csv(row.estudianteNombre()),
                        csv(row.estudianteCorreo()),
                        csv(row.grupoNombre()),
                        csv(row.casoTitulo()),
                        csv(row.notaFinal() == null ? "" : row.notaFinal().toPlainString()),
                        csv(row.estado()),
                        csv(row.fechaPresentacion() == null ? "" : DATE_FORMAT.format(row.fechaPresentacion()))));
                writer.write("\n");
            }
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo generar CSV", exception);
        }
        return output.toByteArray();
    }

    public byte[] exportExcel(List<GradebookEntryResponse> rows) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Calificaciones");
            Row header = sheet.createRow(0);
            String[] columns = {"Estudiante", "Correo", "Curso", "Caso", "Nota", "Estado", "Fecha"};
            for (int i = 0; i < columns.length; i++) {
                header.createCell(i).setCellValue(columns[i]);
            }
            int rowIndex = 1;
            for (GradebookEntryResponse row : rows) {
                Row excelRow = sheet.createRow(rowIndex++);
                excelRow.createCell(0).setCellValue(row.estudianteNombre());
                excelRow.createCell(1).setCellValue(row.estudianteCorreo());
                excelRow.createCell(2).setCellValue(row.grupoNombre() == null ? "" : row.grupoNombre());
                excelRow.createCell(3).setCellValue(row.casoTitulo());
                if (row.notaFinal() != null) {
                    excelRow.createCell(4).setCellValue(row.notaFinal().doubleValue());
                }
                excelRow.createCell(5).setCellValue(row.estado());
                excelRow.createCell(6).setCellValue(
                        row.fechaPresentacion() == null ? "" : DATE_FORMAT.format(row.fechaPresentacion()));
            }
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo generar Excel", exception);
        }
    }

    private String csv(String value) {
        if (value == null) {
            return "\"\"";
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
