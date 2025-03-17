package com.pfe.backend.Service;


import com.pfe.backend.DTO.FicheHistoryDto;

import java.util.List;

public interface FicheAuditService {
    List<FicheHistoryDto> getFicheHistory(Long ficheId);
}
