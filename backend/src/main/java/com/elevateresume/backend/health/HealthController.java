package com.elevateresume.backend.health;

import com.elevateresume.backend.config.AppProperties;
import java.sql.Connection;
import javax.sql.DataSource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    private final DataSource dataSource;
    private final AppProperties properties;

    public HealthController(DataSource dataSource, AppProperties properties) {
        this.dataSource = dataSource;
        this.properties = properties;
    }

    @GetMapping({"/api/health", "/"})
    public HealthResponse health() {
        return new HealthResponse(
                "healthy",
                java.time.OffsetDateTime.now().toString(),
                databaseReachable(),
                properties.getSupabase().isConfigured(),
                properties.getGroq().isConfigured());
    }

    private boolean databaseReachable() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(2);
        } catch (Exception exception) {
            return false;
        }
    }

    public record HealthResponse(
            String status,
            String timestamp,
            boolean databaseConnected,
            boolean supabaseAuthConfigured,
            boolean groqConfigured) {
    }
}
