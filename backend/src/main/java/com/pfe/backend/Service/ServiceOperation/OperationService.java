package com.pfe.backend.Service.ServiceOperation;

import com.pfe.backend.Model.Operation;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface OperationService {
    ResponseEntity<?> addOperation(Operation operation , Long idActionneur);
    ResponseEntity<?> updateOperation(Long idOperation, Operation NewOperationData , Long idActionneur);
    void DeleteOperation(Long idOperation ,Long idActionneur);
    List<Operation> getActiveOperations();
    List<Operation> getOperations();
    List<Operation> getOperationsByUserZones(long idUser);
}
