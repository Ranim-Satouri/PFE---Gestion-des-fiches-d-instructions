package com.pfe.backend.Auth.authentification;

import com.pfe.backend.Model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {

    private User user;
    private String token;
//    private String refreshToken;
    private String groupe;
}
