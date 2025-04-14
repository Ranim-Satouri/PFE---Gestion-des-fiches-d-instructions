package com.pfe.backend.Controller;

import com.pfe.backend.Model.Permission;
import com.pfe.backend.Service.ServicePermission.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/permissions")
public class PremissionController {
    @Autowired
    private PermissionService permissionService;  // Votre service pour récupérer les permissions

    @GetMapping
    public ResponseEntity<List<Permission>> getAllPermissions() {
        List<Permission> permissions = permissionService.getAllPermissions();  // Supposons que ce service récupère les permissions
        return ResponseEntity.ok(permissions);
    }
}
