package com.pfe.backend.Auth.Config;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor

//hethy awl haja lezem tamalha f jwt awl step yali hiya l filter
// l extends a filter by request ou bien implements .. f3odh extends
// firt thing that gets execuedted f jwt filter hiya chekcing if we have a jwt token
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final JwtService jwtService;
  private final UserDetailsService userDetailsService;
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean shouldNotFilter = path.startsWith("/api/v1/auth/");
        System.out.println("JwtAuthenticationFilter - shouldNotFilter pour " + path + ": " + shouldNotFilter);
        return shouldNotFilter;
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        System.out.println("JwtAuthenticationFilter - Requête: " + request.getRequestURI());
        final String authHeader = request.getHeader("Authorization");
        System.out.println("Auth Header: " + authHeader);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("JwtAuthenticationFilter - Aucun token Bearer trouvé");
            filterChain.doFilter(request, response);
            return;
        }
        final String jwt = authHeader.substring(7);
        try {
            final String userMatricule = jwtService.extractUsername(jwt);
            System.out.println("JwtAuthenticationFilter - JWT: " + jwt + ", User: " + userMatricule);

            if (userMatricule != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userMatricule);
                System.out.println("JwtAuthenticationFilter - UserDetails chargé: " + userDetails.getUsername() + ", Rôles: " + userDetails.getAuthorities());

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("JwtAuthenticationFilter - Token validé pour: " + userMatricule);
                } else {
                    System.out.println("JwtAuthenticationFilter - Token invalide pour: " + userMatricule);
                }
            }
            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException e) {
            System.out.println("JwtAuthenticationFilter - Token expiré: " + e.getMessage());
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("JWT token is expired");
            return;
        } catch (SignatureException e) {
            System.out.println("JwtAuthenticationFilter - Erreur de signature JWT: " + e.getMessage());
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Invalid JWT signature");
            return;
        } catch (Exception e) {
            System.out.println("JwtAuthenticationFilter - Erreur JWT: " + e.getMessage());
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Invalid JWT token");
            return;
        }
    }
}