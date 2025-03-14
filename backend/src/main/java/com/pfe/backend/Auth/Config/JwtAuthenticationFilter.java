package com.pfe.backend.Auth.Config;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
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
    protected void doFilterInternal(
           @NonNull HttpServletRequest request,
           @NonNull HttpServletResponse response,
           @NonNull FilterChain filterChain)
            throws ServletException, IOException {
            //when we make a call we need to pass jwt auth token within the header so we will try to extract this header
        final String authHeader = request.getHeader("Authorization");
        //yali entre "Auth.." is the header that contains the jwt token or the bearer token
        final String jwt;
        final String userEmail;
        // tw besh namlo implements lel chekc yali hachtna bih
        if (authHeader == null || !authHeader.startsWith("Bearer "))
        {
            filterChain.doFilter(request,response);
            return;
        }
        //the next step is to extract the token from my authHeader
        jwt = authHeader.substring(7); //started from position seven khtr ybda baed l Bearer w space
        userEmail = jwtService.extractUsername(jwt) ; //todo ectract the userEmail from jwt token , so lezm nasn3o l class jwtservice
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null)
        {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            // the next step is to check if the token is still validate or no
            if (jwtService.isTokenValid(jwt, userDetails)){
               //once our token is valid we need to create an object of type :
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource()
                        .buildDetails(request));
                //now the final step is to update security context holder
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        //we need to hand the filter to the next filters
        filterChain.doFilter(request,response);
        // we created the filter now but it's not yet used so we gonna create a securtty config class
    }
}
