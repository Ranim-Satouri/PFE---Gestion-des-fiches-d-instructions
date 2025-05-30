package com.pfe.backend.Service.ServiceMenu;

import com.pfe.backend.Model.Ligne;
import com.pfe.backend.Model.Menu;
import com.pfe.backend.Model.Permission;
import com.pfe.backend.Repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuServiceImp implements MenuService {
    @Autowired
    private MenuRepository menuRepository;

    @Override
    public List<Menu> getAllMenus() {
        return menuRepository.findAll();
    }
    @Override
    public List<Permission> getPermissionsByMenu(long idMenu) {
        Menu menu = menuRepository.findById(idMenu).orElseThrow(()-> new RuntimeException("Menu introuvable ! "));
        return menu.getPermissions();
    }
}
