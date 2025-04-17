package com.pfe.backend.Controller;


import com.pfe.backend.Model.Operation;
import com.pfe.backend.Service.ServiceOperation.OperationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/operation")
@RestController
public class OperationController {
    @Autowired
    private OperationService operationService;
    @PostMapping("/addOperation")
    public ResponseEntity<?> addOperation(@RequestBody Operation operation, @RequestParam Long idActionneur) {
        try {
            return operationService.addOperation(operation, idActionneur);
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/getAll")
    public ResponseEntity<List<Operation>> getOperations(){
        return ResponseEntity.ok(operationService.getOperations());
    }
    @PutMapping("/update/{idOperation}")
    public ResponseEntity<?> updateOperation(
            @PathVariable Long idOperation,
            @RequestBody Operation newOperationData,
            @RequestParam Long idActionneur) {
        try {
            return operationService.updateOperation(idOperation, newOperationData, idActionneur);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @DeleteMapping("/delete/{idOperation}")
    public ResponseEntity<?> DeleteOperation(@PathVariable Long idOperation , @RequestParam Long idActionneur) {
        try {
            operationService.DeleteOperation(idOperation , idActionneur);
            return ResponseEntity.ok(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/activeOperations")
    public ResponseEntity<List<Operation>> getActiveOperations() {
        return ResponseEntity.ok(operationService.getActiveOperations());
    }
}
