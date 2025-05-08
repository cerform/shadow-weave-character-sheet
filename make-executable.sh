
#!/bin/bash

# Make all shell scripts executable
find . -name "*.sh" -type f -exec chmod +x {} \;

echo "Made all shell scripts executable!"
echo "Next steps:"
echo "1. Run './install-dependencies.sh' to install required packages"
echo "2. Run './run-vite.sh' to start the development server"
