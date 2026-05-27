#!/bin/bash

# Set the source and backup directory
SOURCE_DB="/home/shrust1k/coolspot/BackEnd/main_db.db"
BACKUP_DIR="/home/shrust1k/coolspot/BackEnd/db/db_backup"

# Create the backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Get the current timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Define the backup file name
BACKUP_FILE="$BACKUP_DIR/main_db_$TIMESTAMP.db"

# Copy the database
cp "$SOURCE_DB" "$BACKUP_FILE"

# Print success message
echo "Backup created: $BACKUP_FILE"
