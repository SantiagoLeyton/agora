package com.agora.modules.user.service;

import com.agora.modules.user.dto.RoleResponse;
import com.agora.modules.user.repository.RolRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoleQueryService {

    private final RolRepository rolRepository;

    @Transactional(readOnly = true)
    public List<RoleResponse> listar() {
        return rolRepository.findAll().stream()
                .map(RoleResponse::from)
                .toList();
    }
}
