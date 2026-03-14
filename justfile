home-reconfigure:
    guix home build -k --no-grafts -e '((@ (djeis home) get-this-host-home-config))' -M 8
    guix home reconfigure -e '((@ (djeis home) get-this-host-home-config))' -M 8

system-reconfigure:
    guix system build --substitute-urls="https://cuirass.genenetwork.org https://substitutes.nonguix.org https://bordeaux.guix.gnu.org https://ci.guix.gnu.org" -k --no-grafts -e '((@ (djeis system) get-this-host-os))' -M 8 --fallback
    sudo mv /var/guix/profiles/current-system-graftless-build /var/guix/profiles/current-system-graftless-build.bak
    sudo -E guix system build --substitute-urls="https://cuirass.genenetwork.org https://substitutes.nonguix.org https://bordeaux.guix.gnu.org https://ci.guix.gnu.org" -k -r /var/guix/profiles/current-system-graftless-build --no-grafts -e '((@ (djeis system) get-this-host-os))' -M 8 --fallback
    sudo rm /var/guix/profiles/current-system-graftless-build.bak
    sudo -E guix system reconfigure -e '((@ (djeis system) get-this-host-os))' -M 6

xana-backup:
    sudo modprobe nbd
    sudo rbd-nbd --device /dev/nbd0 map rbd-meta/XANA-tampa-snapshots
    sudo mount /dev/nbd0 /mnt
    sudo btrbk run -vv -c /btrroot/btrbk.conf
    sudo umount /dev/nbd0
    sudo rbd-nbd unmap rbd-meta/XANA-tampa-snapshots
    
bootstrap-home:
    guix home container -N -L $PWD/guixlib --expose=$PWD --expose=/gnu --expose=/var/guix/daemon-socket -e '((@ (djeis home) bootstrapping-home-config))'
