import re
import os

# Path to secrets.h relative to the project root
SECRETS_PATH = os.path.join("src", "secrets.h")

def extract_ota_password():
    """Extract OTA password from the secrets.h file"""
    
    # Get the full path to secrets.h
    project_path = os.getcwd()
    secrets_file = os.path.join(project_path, SECRETS_PATH)
    
    try:
        with open(secrets_file, 'r') as f:
            content = f.read()
            
            # Use regex to find the OTA_PASSWORD value
            match = re.search(r'const\s+char\s*\*\s*OTA_PASSWORD\s*=\s*"([^"]+)"', content)
            if match:
                return match.group(1)
            else:
                print("Warning: OTA_PASSWORD not found in secrets.h")
                return "default_password"
    except Exception as e:
        print(f"Error reading secrets.h: {e}")
        return "default_password"

def env_setup(env):
    """Set up the PlatformIO environment"""
    
    # Extract OTA password from secrets.h
    ota_password = extract_ota_password()
    
    # Set the ota_flags in the environment
    env.Append(
        UPLOADERFLAGS=["--auth=" + ota_password]
    )
    
    # Make the password available as a variable
    env.Replace(
        OTA_PASSWORD=ota_password
    )
    
    # Override the upload flags value in platformio.ini
    if not env.GetProjectOption("ota_flags"):
        env.Replace(
            ota_flags=["--auth=" + ota_password]
        )
    
    print(f"OTA password loaded successfully from secrets.h")
    
    return env 