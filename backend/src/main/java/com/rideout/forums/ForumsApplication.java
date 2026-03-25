package com.rideout.forums;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class ForumsApplication {

	public static void main(String[] args) {
		SpringApplication.run(ForumsApplication.class, args);
	}

}
