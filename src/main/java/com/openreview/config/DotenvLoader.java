package com.openreview.config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class DotenvLoader implements ApplicationContextInitializer<ConfigurableApplicationContext>{

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext){
        ConfigurableEnvironment environment = applicationContext.getEnvironment();

        // Try to load .env file
        String envFilePath = ".env";

        if(!Files.exists(Paths.get(envFilePath))){
            System.out.println("No .env file found, using system environment variables");
            return;
        }

        Map<String, Object> envMap = loadEnvFile(envFilePath);

        if(!envMap.isEmpty()){
            // Add to Spring environment with high priority
            environment.getPropertySources().addFirst(
                    new MapPropertySource("dotenv", envMap)
            );

            System.out.println("Loaded " + envMap.size() + " variables from .env file.");
        }
    }

    private Map<String, Object> loadEnvFile(String envFilePath){
        Map<String, Object> envMap = new HashMap<>();

        try(BufferedReader reader = new BufferedReader(new FileReader(envFilePath))){
            String line;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null){
                lineNumber++;
                line = line.trim();

                // Skip empty lines and comments
                if(line.isEmpty() || line.startsWith("#")){
                    continue;
                }

                // Parse KEY=VALUE
                int equalsIndex = line.indexOf("=");
                if(equalsIndex == -1){
                    System.err.println("Invalid line " + lineNumber + " in .env " + line);
                    continue;
                }

                String key = line.substring(0, equalsIndex).trim();
                String value = line.substring(equalsIndex + 1).trim();

                // Remove quotes if present
                if (value.startsWith("\"") && value.endsWith("\"")) {
                    value = value.substring(1, value.length() - 1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    value = value.substring(1, value.length() - 1);
                }

                envMap.put(key, value);

                // Also set as system property so it can be used in ${} placeholders
                System.setProperty(key, value);
            }
        } catch (IOException e){
            System.out.println("Error reading .env file: " + e.getMessage());
        }
        return envMap;
    }
}
