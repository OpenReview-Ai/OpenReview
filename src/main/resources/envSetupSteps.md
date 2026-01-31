# Environment Setup Instructions

## File Structure

After setup, your project should have these files:

```
openreview/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── openreview/
│       │           └── config/
│       │               └── DotenvLoader.java    ← Create this
│       └── resources/
│           └── application.yml                   ← Already exists (updated)
│
├── .env.example                                  ← Already exists (reference)
├── .env                                          ← Create this (your secrets)
└── .gitignore                                    ← Verify .env is listed
```

## Step-by-Step Setup

### Step 1: Create Your .env File

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   ```bash
   nano .env
   ```

3. **Minimum required values to change:**
   ```bash
   # Get token from: https://github.com/settings/tokens
   GITHUB_TOKEN=ghp_your_actual_token_here

   # Generate with: openssl rand -hex 32
   GITHUB_WEBHOOK_SECRET=abc123def456...your_actual_secret
   ```

4. Save and close the file.

### Step 2: Verify .gitignore

**Important:** Make sure `.env` won't be committed to git!

1. Check your `.gitignore`:
   ```bash
   cat .gitignore | grep .env
   ```

2. You should see:
   ```
   .env
   .env.local
   .env.*.local
   ```

3. If not, add it:
   ```bash
   echo ".env" >> .gitignore
   ```

### Step 3: Test the Setup

1. Start the application:
   ```bash
   ./mvnw spring-boot:run
   ```

2. Look for this message in the startup logs:
   ```
   Loaded 15 variables from .env file
   ```

3. If you see that, it's working! If you see:
   ```
   No .env file found, using system environment variables
   ```
   Then your `.env` file is not in the project root directory.

### Step 4: Verify Variables Are Loaded

Create a test endpoint to verify (optional):

**Create:** `src/main/java/com/openreview/config/EnvTestController.java`

```java
package com.openreview.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class EnvTestController {
    
    @Value("${GITHUB_TOKEN:NOT_SET}")
    private String githubToken;
    
    @Value("${OLLAMA_MODEL:NOT_SET}")
    private String ollamaModel;
    
    @Value("${DEFAULT_MODE:NOT_SET}")
    private String defaultMode;
    
    @GetMapping("/api/test/env")
    public Map<String, String> testEnv() {
        Map<String, String> result = new HashMap<>();
        result.put("github_token_loaded", githubToken.equals("NOT_SET") ? "❌" : "✅");
        result.put("ollama_model", ollamaModel);
        result.put("default_mode", defaultMode);
        return result;
    }
}
```

Then test:
```bash
curl http://localhost:8080/api/test/env
```

Expected output:
```json
{
  "github_token_loaded": "✅",
  "ollama_model": "codellama:13b",
  "default_mode": "beginner"
}
```

## Troubleshooting

### Problem: "Could not resolve placeholder 'GITHUB_TOKEN'"

**Cause:** Environment variable not loaded.

**Solutions:**

1. **Check .env file location:**
   ```bash
   ls -la .env
   ```
   Should be in project root, not in `src/`

2. **Check file syntax:**
   ```bash
   cat .env | head -5
   ```
   Should look like:
   ```
   GITHUB_TOKEN=ghp_xxx
   DATABASE_URL=jdbc:postgresql://...
   ```
   NOT:
   ```
   export GITHUB_TOKEN=ghp_xxx   ← Wrong!
   GITHUB_TOKEN = ghp_xxx        ← Wrong! (spaces around =)
   ```

3. **Check application.yml:**
   ```bash
   grep -A 3 "context:" src/main/resources/application.yml
   ```
   Should show:
   ```yaml
   context:
     initializer:
       classes: com.openreview.config.DotenvLoader
   ```

4. **Restart the application:**
   ```bash
   # Stop with Ctrl+C, then
   ./mvnw spring-boot:run
   ```

### Problem: "No .env file found" message

**Cause:** `.env` file is not in the project root.

**Solution:**
```bash
# Check where you are
pwd

# Should be in project root like:
# /Users/you/projects/openreview

# Check if .env exists
ls -la | grep .env

# If not, create it
cp .env.example .env
```

### Problem: Variables have default values instead of .env values

**Cause:** Variable names don't match between `.env` and `application.yml`.

**Solution:**
1. Check variable name spelling (case-sensitive):
   ```bash
   grep GITHUB_TOKEN .env
   grep GITHUB_TOKEN src/main/resources/application.yml
   ```

2. Names must match exactly:
   - `.env`: `GITHUB_TOKEN=xxx`
   - `application.yml`: `${GITHUB_TOKEN}`

### Problem: IDE not recognizing DotenvLoader class

**Cause:** IDE hasn't indexed the new file.

**Solution:**

**IntelliJ IDEA:**
```
File → Invalidate Caches → Invalidate and Restart
```

**Eclipse:**
```
Project → Clean → Clean all projects
```

**VS Code:**
```
Ctrl+Shift+P → Java: Clean Java Language Server Workspace
```
