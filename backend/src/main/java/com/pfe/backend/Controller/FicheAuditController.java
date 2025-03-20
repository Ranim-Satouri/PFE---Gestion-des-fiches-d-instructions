package com.pfe.backend.Controller;

import com.pfe.backend.DTO.FicheHistoryDto;
import com.pfe.backend.ServiceFiche.FicheAuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/ficheAudit")
@Controller
public class FicheAuditController {
    @Autowired
    private FicheAuditService ficheAuditService;

    @GetMapping("/getFicheAudit/{id}")
    public ResponseEntity<List<FicheHistoryDto>> getFicheHistory(@PathVariable Long id) {
        List<FicheHistoryDto> history = ficheAuditService.getFicheHistory(id);
        return ResponseEntity.ok(history);
    }
}
