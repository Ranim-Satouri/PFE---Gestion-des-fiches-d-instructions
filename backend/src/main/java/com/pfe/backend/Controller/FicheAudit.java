package com.pfe.backend.Controller;

import com.pfe.backend.Model.Famille;
import com.pfe.backend.Model.FicheHistoryDto;
import com.pfe.backend.Service.FamilleService;
import com.pfe.backend.Service.FicheAuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/ficheAudit")
@Controller
public class FicheAudit {
    @Autowired
    private FicheAuditService ficheAuditService;

    @GetMapping("/getFicheAudit/{id}")
    public ResponseEntity<List<FicheHistoryDto>> getFicheHistory(@PathVariable Long id) {
        List<FicheHistoryDto> history = ficheAuditService.getFicheHistory(id);
        return ResponseEntity.ok(history);
    }
}
