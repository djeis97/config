home-reconfigure:
    guix home build --no-grafts -L $PWD/guixlib home/home-configuration.scm -M 8
    guix home reconfigure -L $PWD/guixlib home/home-configuration.scm -M 8

laptop-reconfigure:
    sudo guix system build --no-grafts -L $PWD/guixlib laptop.scm -M 6
    sudo guix system reconfigure -L $PWD/guixlib laptop.scm -M 6

xana-reconfigure:
    sudo guix system build --no-grafts -L $PWD/guixlib xana-tampa.scm -M 6
    sudo guix system reconfigure -L $PWD/guixlib xana-tampa.scm -M 6

xana-backup:
    sudo modprobe nbd
    sudo rbd-nbd --device /dev/nbd0 map rbd-meta/XANA-tampa-snapshots
    sudo mount /dev/nbd0 /mnt
    sudo btrbk run -vv -c /btrroot/btrbk.conf
    sudo umount /dev/nbd0
    sudo rbd-nbd unmap rbd-meta/XANA-tampa-snapshots
    
xana-steam:
    XMODIFIERS= guix shell -f home/xana-tampa-steam.scm -- steam

