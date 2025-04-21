package com.pfe.backend.Controller;

import com.pfe.backend.Model.Groupe;
import com.pfe.backend.Service.ServiceGroupe.GroupeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/groupe")
@RestController
public class GroupeController {
    @Autowired
    private GroupeService groupeService;
    @PostMapping("/addGroupe")
    public ResponseEntity<?> addGroupe(@RequestBody Groupe groupe, @RequestParam Long idActionneur) {
        try {
            return groupeService.addGroupe(groupe, idActionneur);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/getAll")
    public ResponseEntity<List<Groupe>> getGroupes(){
        return ResponseEntity.ok(groupeService.getGroupes());
    }
    @PutMapping("/update/{idGrp}")
    public ResponseEntity<?> updateGroupe(
            @PathVariable Long idGrp,
            @RequestBody Groupe newGroupeData,
            @RequestParam Long idActionneur) {
        try {
            return groupeService.updateGroupe(idGrp, newGroupeData, idActionneur);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @DeleteMapping("/delete/{idGrp}")
    public ResponseEntity<?> DeleteGroupe(@PathVariable Long idGrp , @RequestParam Long idActionneur) {
        try {
            groupeService.DeleteGroupe(idGrp , idActionneur);
            return ResponseEntity.ok(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/activeGroupes")
    public ResponseEntity<List<Groupe>> getActiveGroupes() {
        return ResponseEntity.ok(groupeService.getActiveGroupes());
    }
    @PostMapping("/addRelationsToGroup")
    public ResponseEntity<?> addRelationsToGroup(@RequestParam Long groupId,
                                                      @RequestParam List<Long> menuIds,
                                                      @RequestParam List<Long> permissionIds,
                                                      @RequestParam List<Long> userIds,
                                                      @RequestParam Long idActionneur) {
        try {
            Groupe result = groupeService.addRelationsToGroup(groupId, menuIds, permissionIds, userIds, idActionneur);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'ajout des relations : " + e.getMessage());        }
    }
}
