package com.elevateresume.backend.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Cors cors = new Cors();
    private Supabase supabase = new Supabase();
    private Groq groq = new Groq();

    public Cors getCors() {
        return cors;
    }

    public void setCors(Cors cors) {
        this.cors = cors;
    }

    public Supabase getSupabase() {
        return supabase;
    }

    public void setSupabase(Supabase supabase) {
        this.supabase = supabase;
    }

    public Groq getGroq() {
        return groq;
    }

    public void setGroq(Groq groq) {
        this.groq = groq;
    }

    public static class Cors {
        private List<String> allowedOrigins = new ArrayList<>();

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class Supabase {
        private String url = "";
        private String publishableKey = "";

        public boolean isConfigured() {
            return url != null && !url.isBlank()
                    && publishableKey != null && !publishableKey.isBlank();
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getPublishableKey() {
            return publishableKey;
        }

        public void setPublishableKey(String publishableKey) {
            this.publishableKey = publishableKey;
        }
    }

    public static class Groq {
        private String apiKey = "";
        private String model = "llama-3.3-70b-versatile";
        private String baseUrl = "https://api.groq.com/openai/v1";

        public boolean isConfigured() {
            return apiKey != null && !apiKey.isBlank();
        }

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }
    }
}
