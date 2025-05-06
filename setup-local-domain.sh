#!/bin/bash

echo "This script will set up todo.com to point to localhost in your hosts file."
echo "It requires sudo access to modify the hosts file."

# Check if running as root
if [ "$(id -u)" != "0" ]; then
   echo "This script must be run with sudo. Trying sudo now..."
   sudo bash "$0" "$@"
   exit $?
fi

# Add todo.com to hosts file if not already there
if ! grep -q "todo.com" /etc/hosts; then
    echo "Adding todo.com to /etc/hosts..."
    echo "127.0.0.1 todo.com" >> /etc/hosts
    echo "Added todo.com successfully!"
else
    echo "todo.com is already in your hosts file!"
fi

echo "Setup complete!"
echo "You can now access the app at http://todo.com:1212" 