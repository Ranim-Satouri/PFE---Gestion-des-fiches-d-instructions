package com.pfe.backend.configuration;


import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;


public class EncryptionUtils {

    private static final String ALGORITHM = "AES";

    // Générer une clé AES-256 de manière sécurisée (methode hedhy marra bark nexectiha jsute bech nasna3 el clé w ba3d nab9a nestaaml fih nafsou)
    // najem aala kol fiche nasna3 clé amma lezem nwali nestocki kol ficha w el clé te3ha bech najem ndecriptiha
    private static SecretKey generateSecureKey() throws Exception {
        KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
        keyGenerator.init(256); // AES-256
        return keyGenerator.generateKey();
    }

    // Sauvegarder la clé de manière sécurisée (exemple de sauvegarde dans un fichier chiffré)
    private static void saveKeyToFile(SecretKey key, String filename) throws IOException {
        byte[] encodedKey = key.getEncoded();
        try (FileOutputStream fos = new FileOutputStream(filename)) {
            fos.write(encodedKey);
        }
    }

    // Charger la clé depuis un fichier sécurisé
    private static SecretKey loadKeyFromFile(String filename) throws IOException {
        byte[] encodedKey;
        try (FileInputStream fis = new FileInputStream(filename)) {
            encodedKey = fis.readAllBytes();
        }
        return new SecretKeySpec(encodedKey, ALGORITHM);
    }

    // methode bech njib beha el secretKey ( kenou deja mawjoud si non nasna3 wehed ) sta3melt feha les methodes 3 li fou9
    public static SecretKey loadOrGenerateEncryptionKey() throws Exception {
        File keyFile = new File( "C:\\Users\\Ranim\\Desktop\\" + "encryption.key");
        if (keyFile.exists()) {
            // Si la clé existe déjà, la charger depuis le fichier
            return loadKeyFromFile(keyFile.getPath());
        } else {
            // Sinon, générer une nouvelle clé et la sauvegarder
            SecretKey secretKey = generateSecureKey();
            saveKeyToFile(secretKey, keyFile.getPath());
            return secretKey;
        }
    }
    // Méthode de chiffrement avec une clé
    public static byte[] encrypt(byte[] data, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(data);
    }

    // Méthode de déchiffrement avec une clé
    public static byte[] decrypt(byte[] data, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, key);
        return cipher.doFinal(data);
    }


}
