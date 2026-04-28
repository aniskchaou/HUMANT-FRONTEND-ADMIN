package com.dev.delta;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.security.SecurityDataConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.dev.delta.dto.AwardDTO;
@ComponentScan({ "com.dev.delta.security", "com.dev.delta.controllers", "com.dev.delta.dto",
"com.dev.delta.services" }) // to scan repository files
@EntityScan("com.dev.delta.entities")
@EnableJpaRepositories("com.dev.delta.repositories")
@SpringBootApplication(exclude = SecurityAutoConfiguration.class)
public class SpringbootHumantCodecanyonApplication implements CommandLineRunner{

	@Autowired
	AwardDTO awardDTO;
	public static void main(String[] args) {
		SpringApplication.run(SpringbootHumantCodecanyonApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// TODO Auto-generated method stub
		awardDTO.populate();
	}

}
