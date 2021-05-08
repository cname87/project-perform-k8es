#!/bin/bash

# Run to try avoid low memory which prevents git running in cloudbuild
# Eventually will need to repartition

sudo apt autoremove
sudo apt autoclean

sudo du -sh /var/cache/apt
sudo apt-get clean

journalctl --disk-usage
sudo journalctl --vacuum-time=3d

sudo du -h /var/lib/snapd/snaps
# Removes old revisions of snaps
# CLOSE ALL SNAPS BEFORE RUNNING THIS
set -eu
sudo snap list --all | awk '/disabled/{print $1, $3}' |
    while read snapname revision; do
        snap remove "$snapname" --revision="$revision"
    done

# sudo du -sh ~/.cache/thumbnails
# sudo rm -rf ~/.cache/thumbnails/*

# Deletes home .cache directory
rm -rf ~/.cache/*

# NB: Empty the trash folder
cd ~/.local/share/Trash/
echo "empty the trash manually"
# rm -rf

sudo rm /var/lib/snapd/cache/*
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

