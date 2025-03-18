package com.pfe.backend.Service;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImp implements FileStorageService {

    private static final String STORAGE_DIR = "C:\\Users\\Ranim\\Desktop\\pdf_storage\\";

    public String saveFile(MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            throw new IOException("Le fichier est vide");
        }

        File uploadDir = new File(STORAGE_DIR);
        if (!uploadDir.exists()) uploadDir.mkdirs(); // Créer le dossier s'il n'existe pas

        // Générer un nom unique
        //String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
       //String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        String fileName = file.getOriginalFilename();

        // Définir le chemin complet
        Path destinationPath = Path.of(STORAGE_DIR + fileName);

        // Copier le fichier
        //Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);

        //Files.createDirectories(path.getParent()); // Crée le dossier s'il n'existe pas
        Files.write(destinationPath, file.getBytes()); // Sauvegarde le fichier

        return fileName; // Retourne juste le nom du fichier
    }

    public byte[] getFile(String fileName) throws IOException {
        Path filePath = Path.of(STORAGE_DIR + fileName);
        return Files.readAllBytes(filePath);
    }

    public void deleteFile(String fileName) throws IOException {
        Path filePath = Path.of(STORAGE_DIR + fileName);
        Files.deleteIfExists(filePath);
    }
}
