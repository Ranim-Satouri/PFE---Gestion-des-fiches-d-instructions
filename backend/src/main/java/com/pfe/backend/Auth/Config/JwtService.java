 //signinKEy returns a key , it's a secret that is used to create the signature part of jwt,used to ensure that the same client that is sending this jwt key is the one who claims who to be
    package com.pfe.backend.Auth.Config;

 import com.pfe.backend.Model.User;
 import io.jsonwebtoken.Claims;
 import io.jsonwebtoken.Jwts;
 import io.jsonwebtoken.SignatureAlgorithm;
 import io.jsonwebtoken.io.Decoders;
 import io.jsonwebtoken.security.Keys;
 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.beans.factory.annotation.Value;
 import org.springframework.security.core.userdetails.UserDetails;
 import org.springframework.stereotype.Service;
 import org.springframework.transaction.annotation.Transactional;

 import java.util.Date;
 import java.security.Key;
 import java.util.HashMap;
 import java.util.Map;
 import java.util.Optional;
 import java.util.function.Function;

 @Service
    public class JwtService {
     @Value("${jwt.secret}")
     private String SECRET_KEY;

     @Value("${jwt.refresh-token.expiration:604800000}") // 7 jours par défaut
     private long REFRESH_TOKEN_EXPIRATION;

     @Autowired
     private RefreshTokenRepository refreshTokenRepository;
     private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 30; // 1 minute pour les tests

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
     @Transactional
     public String generateRefreshToken(UserDetails userDetails) {
         Map<String, Object> claims = new HashMap<>();
         claims.put("token_type", "refresh");
         String refreshToken = Jwts.builder()
                 .setClaims(claims)
                 .setSubject(userDetails.getUsername())
                 .setIssuedAt(new Date(System.currentTimeMillis()))
                 .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
                 .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                 .compact();

         // Sauvegarder le nouveau refresh token
         User user = (User) userDetails;
         RefreshToken refreshTokenEntity = new RefreshToken();
         refreshTokenEntity.setToken(refreshToken);
         refreshTokenEntity.setUser(user);
         refreshTokenEntity.setExpiryDate(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION));
         refreshTokenEntity.setRevoked(false);

         // Réessayer en cas de conflit
         int maxAttempts = 3;
         for (int attempt = 1; attempt <= maxAttempts; attempt++) {
             try {
                 System.out.println("Saving new refresh token for user: " + user.getMatricule() + ", attempt: " + attempt);
                 refreshTokenRepository.save(refreshTokenEntity);
                 return refreshToken;
             } catch (Exception e) {
                 System.out.println("Failed to save refresh token for user " + user.getMatricule() + ": " + e.getMessage());
                 if (attempt == maxAttempts) {
                     throw new RuntimeException("Failed to save refresh token after " + maxAttempts + " attempts", e);
                 }
                 // Attendre avant de réessayer
                 try {
                     Thread.sleep(100);
                 } catch (InterruptedException ie) {
                     Thread.currentThread().interrupt();
                     throw new RuntimeException("Interrupted during retry", ie);
                 }
             }
         }
         throw new RuntimeException("Failed to save refresh token after retries");
     }

     public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
         Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByToken(token);
         if (refreshTokenOpt.isEmpty()) {
             System.out.println("Refresh token not found in database: " + token);
             return false;
         }

         RefreshToken refreshToken = refreshTokenOpt.get();
         boolean isExpired = refreshToken.getExpiryDate().before(new Date());
         boolean isRevoked = refreshToken.isRevoked();
         boolean userMatches = refreshToken.getUser().getMatricule().equals(userDetails.getUsername());
         System.out.println("Validating refresh token " + token + " - Expired: " + isExpired + ", Revoked: " + isRevoked + ", User matches: " + userMatches);
         return !isExpired && !isRevoked && userMatches;
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