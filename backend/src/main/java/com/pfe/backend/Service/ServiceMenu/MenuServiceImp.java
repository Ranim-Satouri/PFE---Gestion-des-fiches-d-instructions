package com.pfe.backend.Service.ServiceMenu;

import com.pfe.backend.Model.Menu;
import com.pfe.backend.Repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuServiceImp implements MenuService {
    @Autowired
    private MenuRepository menuRepository;

    public List<Menu> getAllMenus() {
        return menuRepository.findAll();  // Récupère tous les menus de la base de données
    }
}
