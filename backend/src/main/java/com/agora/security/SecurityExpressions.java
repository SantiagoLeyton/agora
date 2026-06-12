package com.agora.security;

public final class SecurityExpressions {

    public static final String CASE_MANAGER = "hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN')";
    public static final String CASE_READER = "hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN','DOCENTE','ESTUDIANTE')";
    public static final String TEACHER_ACTIVITY = "hasAnyRole('DOCENTE','DOCENTE_ADMIN')";
    public static final String TEACHER_OR_ADMIN = "hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN','DOCENTE')";
    public static final String RESOURCE_READER = "hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN','DOCENTE')";
    public static final String ACADEMIC_PARTICIPANT = "hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN','DOCENTE','ESTUDIANTE')";
    public static final String TEACHER_FEEDBACK = "hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN','DOCENTE')";
    public static final String TEACHER_METRICS = "hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN','DOCENTE')";
    public static final String ACADEMIC_PROGRESS = "hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN','DOCENTE','ESTUDIANTE')";

    private SecurityExpressions() {
    }
}
