package com.agora.modules.case_management.dto;

import com.agora.modules.case_management.domain.Herramienta;

public record ToolResponse(Long id, String nombre, String descripcion, String tipo, boolean activo) {

    public static ToolResponse from(Herramienta herramienta) {
        return new ToolResponse(herramienta.getId(), herramienta.getNombre(), herramienta.getDescripcion(),
                herramienta.getTipo(), herramienta.isActivo());
    }
}
