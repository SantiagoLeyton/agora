package com.agora.modules.academic.service;

import com.agora.modules.academic.domain.Grupo;
import com.agora.modules.academic.domain.Programacion;
import com.agora.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
class AcademicAccessService {

    static final String ADMIN = "ADMINISTRADOR";
    static final String TEACHER = "DOCENTE";
    static final String STUDENT = "ESTUDIANTE";

    boolean isAdmin(UserPrincipal principal) {
        return ADMIN.equals(principal.rol());
    }

    boolean isTeacher(UserPrincipal principal) {
        return TEACHER.equals(principal.rol());
    }

    boolean isStudent(UserPrincipal principal) {
        return STUDENT.equals(principal.rol());
    }

    boolean owns(Grupo grupo, UserPrincipal principal) {
        return grupo.getDocente().getId().equals(principal.id());
    }

    boolean owns(Programacion programacion, UserPrincipal principal) {
        return programacion.getDocente().getId().equals(principal.id());
    }

    boolean isMember(Grupo grupo, UserPrincipal principal) {
        return grupo.getEstudiantes().stream()
                .anyMatch(estudiante -> estudiante.getEstudiante().getId().equals(principal.id()));
    }

    void requireTeacherOwner(Grupo grupo, UserPrincipal principal) {
        if (!isTeacher(principal) || !owns(grupo, principal)) {
            throw new AccessDeniedException("No puede modificar grupos de otros docentes");
        }
    }

    void requireTeacherOwner(Programacion programacion, UserPrincipal principal) {
        if (!isTeacher(principal) || !owns(programacion, principal)) {
            throw new AccessDeniedException("No puede modificar programaciones de otros docentes");
        }
    }

    void requireReadable(Grupo grupo, UserPrincipal principal) {
        if (isAdmin(principal) || owns(grupo, principal) || isMember(grupo, principal)) {
            return;
        }
        throw new AccessDeniedException("No puede consultar este grupo");
    }

    void requireReadable(Programacion programacion, UserPrincipal principal) {
        if (isAdmin(principal) || owns(programacion, principal) || isMember(programacion.getGrupo(), principal)) {
            return;
        }
        throw new AccessDeniedException("No puede consultar esta programacion");
    }
}
