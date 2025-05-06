package com.pfe.backend.Service.ServiceMenu;

import com.pfe.backend.Model.Menu;
import com.pfe.backend.Model.Permission;

import java.util.List;

public interface MenuService {
    List<Menu> getAllMenus();
    List<Permission> getPermissionsByMenu(long idMenu);
}
