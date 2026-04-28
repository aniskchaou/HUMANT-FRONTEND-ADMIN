package com.dev.delta.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

	PasswordEncoder passwordEncoder;

	private final DatabaseUserDetailsService databaseUserDetailsService;

	@Autowired
	public WebSecurityConfig(PasswordEncoder passwordEncoder, DatabaseUserDetailsService databaseUserDetailsService) {
		super();
		this.passwordEncoder = passwordEncoder;
		this.databaseUserDetailsService = databaseUserDetailsService;
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(databaseUserDetailsService).passwordEncoder(passwordEncoder);
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.cors().and().csrf().disable().

				authorizeRequests()
				.antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
				.antMatchers(HttpMethod.GET, "/user/session").authenticated()
				.antMatchers("/user/**").hasRole("ADMIN")
				.antMatchers("/api/admin/access-policies/**").hasRole("ADMIN")
				.antMatchers("/api/admin/audit-logs/**").hasRole("ADMIN")
				.antMatchers(HttpMethod.GET, "/api/companies/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.POST, "/api/companies/**").hasRole("ADMIN")
				.antMatchers(HttpMethod.PUT, "/api/companies/**").hasRole("ADMIN")
				.antMatchers(HttpMethod.GET, "/employee/me").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.PUT, "/employee/me").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.GET, "/employee/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.POST, "/employee/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.PUT, "/employee/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.DELETE, "/employee/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.GET, "/leave/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/leave/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.PUT, "/leave/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.DELETE, "/leave/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.GET, "/typeleave/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/typeleave/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.PUT, "/typeleave/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.DELETE, "/typeleave/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.GET, "/api/policies/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.POST, "/api/policies/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.PUT, "/api/policies/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.DELETE, "/api/policies/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.GET, "/api/workspace-configuration/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.PUT, "/api/workspace-configuration/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.GET, "/api/workspace-automation/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.GET, "/api/custom-fields/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.POST, "/api/custom-fields/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.PUT, "/api/custom-fields/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.DELETE, "/api/custom-fields/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.GET, "/api/approval-flows/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.POST, "/api/approval-flows/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.PUT, "/api/approval-flows/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.DELETE, "/api/approval-flows/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.GET, "/api/workflow-rules/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.POST, "/api/workflow-rules/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.PUT, "/api/workflow-rules/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.DELETE, "/api/workflow-rules/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.GET, "/api/payrolls/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.POST, "/api/payrolls/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.PUT, "/api/payrolls/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.DELETE, "/api/payrolls/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.GET, "/api/pay-slips/**").hasAnyRole("ADMIN", "HR", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/api/pay-slips/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.PUT, "/api/pay-slips/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.DELETE, "/api/pay-slips/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.GET, "/api/performance-goals/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/api/performance-goals/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.PUT, "/api/performance-goals/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.DELETE, "/api/performance-goals/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.GET, "/api/performance-reviews/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/api/performance-reviews/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.PUT, "/api/performance-reviews/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.DELETE, "/api/performance-reviews/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.GET, "/api/feedbacks/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/api/feedbacks/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.PUT, "/api/feedbacks/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.DELETE, "/api/feedbacks/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.GET, "/resignation/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/resignation/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.PUT, "/resignation/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.DELETE, "/resignation/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.GET, "/api/exit-requests/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/api/exit-requests/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.PUT, "/api/exit-requests/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.DELETE, "/api/exit-requests/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.GET, "/api/exit-interviews/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/api/exit-interviews/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.PUT, "/api/exit-interviews/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.DELETE, "/api/exit-interviews/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.GET, "/api/clearances/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/api/clearances/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.PUT, "/api/clearances/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.DELETE, "/api/clearances/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.GET, "/api/final-settlements/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/api/final-settlements/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.PUT, "/api/final-settlements/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.DELETE, "/api/final-settlements/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.GET, "/api/expense-claims/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/api/expense-claims/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.PUT, "/api/expense-claims/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.DELETE, "/api/expense-claims/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.GET, "/api/reimbursements/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
				.antMatchers(HttpMethod.POST, "/api/reimbursements/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.PUT, "/api/reimbursements/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.DELETE, "/api/reimbursements/**").hasRole("ADMIN")
				.antMatchers(HttpMethod.POST, "/api/documents/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.GET, "/api/documents/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.GET, "/api/onboarding-checklists/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.POST, "/api/onboarding-checklists/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.PUT, "/api/onboarding-checklists/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.DELETE, "/api/onboarding-checklists/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.GET, "/api/notifications/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.POST, "/api/notifications/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.PUT, "/api/notifications/**").hasAnyRole("ADMIN", "HR", "MANAGER")
				.antMatchers(HttpMethod.GET, "/api/roles/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.POST, "/api/roles/**").hasRole("ADMIN")
				.antMatchers(HttpMethod.PUT, "/api/roles/**").hasRole("ADMIN")
				.antMatchers(HttpMethod.DELETE, "/api/roles/**").hasRole("ADMIN")
				.antMatchers(HttpMethod.PUT, "/api/documents/**").hasAnyRole("ADMIN", "HR")
				.antMatchers(HttpMethod.DELETE, "/api/documents/**").hasRole("ADMIN")
				.anyRequest().authenticated()
				.and().httpBasic();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(List.of("*"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Override
	@Bean
	protected UserDetailsService userDetailsService() {
		return databaseUserDetailsService;

	}

}