 //signinKEy returns a key , it's a secret that is used to create the signature part of jwt,used to ensure that the same client that is sending this jwt key is the one who claims who to be
    package com.pfe.backend.Auth.Config;

 import io.jsonwebtoken.Claims;
 import io.jsonwebtoken.Jwts;
 import io.jsonwebtoken.SignatureAlgorithm;
 import io.jsonwebtoken.io.Decoders;
 import io.jsonwebtoken.security.Keys;
 import org.springframework.security.core.userdetails.UserDetails;
 import org.springframework.stereotype.Service;

 import java.security.Key;
 import java.sql.Date;
 import java.util.HashMap;
 import java.util.Map;
 import java.util.function.Function;

 @Service
    public class JwtService {
        private static final String SECRET_KEY = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

        public String extractUsername(String token) {

            return extractClaim(token,Claims::getSubject); // Extrait le sujet (username) du JWT
        }
        public <T> T extractClaim(String token, Function<Claims,T> claimsResolver)
        {
            final Claims claims = extractAllClaims(token);
            return claimsResolver.apply(claims);
        }
        public String generateToken(UserDetails userDetails)
        {
            return generateToken(new HashMap<>(),userDetails);
        }

        public String generateToken(
                Map<String,Object> extraClaims, UserDetails userDetails
        ) {
            return String.valueOf(Jwts.
                    builder().
                    setClaims(extraClaims)
                    .setSubject(userDetails.getUsername())
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                    .signWith(getSignInKey(), SignatureAlgorithm.HS256).compact()
            );
        }
        private Claims extractAllClaims(String token) {
            return Jwts
                    .parser().setSigningKey(getSignInKey()) // Définit la clé de signature
                    .build()
                    .parseClaimsJws(token) // Parse le JWT
                    .getBody(); // Extrait les claims
        }

        private Key getSignInKey() {
            byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY); // Décode la clé secrète en base64
            return Keys.hmacShaKeyFor(keyBytes); // Crée une clé HMAC
        }
   //methode pour valider le token , to validate is the token belong to the user
     public boolean isTokenValid(String token, UserDetails userDetails)
     {
         final String username = extractUsername(token);
         return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
     }
     private java.util.Date extractExpiration(String token)
     {
         return extractClaim(token,Claims::getExpiration);
     }
     private boolean isTokenExpired(String token)
     {
         return  extractExpiration(token).before(new java.util.Date());
     }
    }