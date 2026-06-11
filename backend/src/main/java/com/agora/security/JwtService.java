package com.agora.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final Clock clock;
    private final SecretKey signingKey;

    @Autowired
    public JwtService(JwtProperties properties) {
        this(properties, Clock.systemUTC());
    }

    JwtService(JwtProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
        this.signingKey = Keys.hmacShaKeyFor(decodeSecret(properties.secret()));
    }

    public String generateAccessToken(UserPrincipal principal) {
        Instant issuedAt = clock.instant();
        Instant expiresAt = issuedAt.plusSeconds(properties.accessTokenExpirationSeconds());
        return Jwts.builder()
                .subject(principal.getUsername())
                .claim("uid", principal.id())
                .claim("role", principal.rol())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isValid(String token, UserPrincipal principal) {
        Claims claims = parseClaims(token);
        return claims.getSubject().equalsIgnoreCase(principal.getUsername())
                && claims.getExpiration().toInstant().isAfter(clock.instant());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .clock(() -> Date.from(clock.instant()))
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private byte[] decodeSecret(String secret) {
        String trimmedSecret = secret.trim();
        try {
            return Decoders.BASE64.decode(trimmedSecret);
        } catch (DecodingException standardBase64Exception) {
            try {
                return Decoders.BASE64URL.decode(trimmedSecret);
            } catch (DecodingException base64UrlException) {
                throw new IllegalArgumentException(
                        "security.jwt.secret must be a Base64 or Base64URL encoded value with at least 32 bytes",
                        base64UrlException);
            }
        }
    }
}
