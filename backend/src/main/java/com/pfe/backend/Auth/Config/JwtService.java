 //signinKEy returns a key , it's a secret that is used to create the signature part of jwt,used to ensure that the same client that is sending this jwt key is the one who claims who to be
    package com.pfe.backend.Auth.Config;

 import io.jsonwebtoken.Claims;
 import io.jsonwebtoken.Jwts;
 import io.jsonwebtoken.SignatureAlgorithm;
 import io.jsonwebtoken.io.Decoders;
 import io.jsonwebtoken.security.Keys;
 import org.springframework.beans.factory.annotation.Value;
 import org.springframework.security.core.userdetails.UserDetails;
 import org.springframework.stereotype.Service;
 import java.util.Date;
 import java.security.Key;
 import java.util.HashMap;
 import java.util.Map;
 import java.util.function.Function;

 @Service
    public class JwtService {
     @Value("${jwt.secret}")
     private String SECRET_KEY;

     @Value("${jwt.refresh-token.expiration:604800000}") // 7 jours par défaut
     private long REFRESH_TOKEN_EXPIRATION;

     private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 60; // 1 minute pour les tests

     public String extractUsername(String token) {
         return extractClaim(token, Claims::getSubject);
     }

     public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
         final Claims claims = extractAllClaims(token);
         return claimsResolver.apply(claims);
     }

     public String generateToken(UserDetails userDetails) {
         return generateToken(new HashMap<>(), userDetails);
     }

     public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
         extraClaims.put("token_type", "access"); // Indique que c'est un accessToken
         return Jwts.builder()
                 .setClaims(extraClaims)
                 .setSubject(userDetails.getUsername())
                 .setIssuedAt(new Date(System.currentTimeMillis()))
                 .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                 .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                 .compact();
     }

     public String generateRefreshToken(UserDetails userDetails) {
         Map<String, Object> claims = new HashMap<>();
         claims.put("token_type", "refresh"); // Indique que c'est un refreshToken
         return Jwts.builder()
                 .setClaims(claims)
                 .setSubject(userDetails.getUsername())
                 .setIssuedAt(new Date(System.currentTimeMillis()))
                 .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
                 .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                 .compact();
     }

     public boolean isTokenValid(String token, UserDetails userDetails) {
         final String username = extractUsername(token);
         final String tokenType = extractClaim(token, claims -> claims.get("token_type", String.class));
         return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
     }

     private Claims extractAllClaims(String token) {
         return Jwts.parser()
                 .setSigningKey(getSignInKey())
                 .build()
                 .parseClaimsJws(token)
                 .getBody();
     }

     private Key getSignInKey() {
         byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
         return Keys.hmacShaKeyFor(keyBytes);
     }

     private Date extractExpiration(String token) {
         return extractClaim(token, Claims::getExpiration);
     }

     private boolean isTokenExpired(String token) {
         return extractExpiration(token).before(new Date());
     }
 }
 //     public String generateRefreshToken(UserDetails userDetails) {
//         return Jwts.builder()
//                 .setSubject(userDetails.getUsername())
//                 .setIssuedAt(new Date(System.currentTimeMillis()))
//                 .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 7)) // 7 days
//                 .signWith(getSignInKey(), SignatureAlgorithm.HS256)
//                 .compact();
//     }