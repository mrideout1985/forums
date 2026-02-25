package com.rideout.forums;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
	info = @Info(
		title = "Rideout Forums API",
		version = "1.0.0",
		description = "OpenAPI documentation for Rideout Forums API with JWT authentication.",
		contact = @Contact(
			name = "Forums Support",
			email = "support@rideoutforums.com"
		),
		license = @License(
			name = "Apache 2.0",
			url = "https://www.apache.org/licenses/LICENSE-2.0.html"
		)
	),
	servers = {
		@Server(
			url = "http://localhost:8080",
			description = "Local Development Server"
		),
		@Server(
			url = "https://api.rideoutforums.com",
			description = "Production Server"
		)
	}
)
@SecurityScheme(
	name = "Bearer Authentication",
	type = SecuritySchemeType.HTTP,
	scheme = "bearer",
	bearerFormat = "JWT",
	description = "JWT authentication token. Use the token received from /api/auth/login or /api/auth/register",
	in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}

