---
title: Hosting an I2P Eepsite
description: Step-by-step guide to hosting your own website on the I2P network using I2Pd and Caddy.
pubDate: 2026-01-08
tags: [i2p, self-hosting]
---

I set this site up on I2P using [this guide from Let's Decentralize](https://letsdecentralize.org/setup.html#i2p). It's simpler than you'd think. Here's how I did it.

## What's an Eepsite?

An eepsite is just a website hosted on I2P. Instead of a regular domain, you get a .i2p address like `o5ntqp4ylvgz5orzip7wxyvmszfwherbmqr2xcqvausex4avvjqa.b32.i2p`. Only accessible through I2P.

The address is your public key hash. You can't choose it, but you can register a human-readable name through a jump service or addressbook.

## Why an Eepsite?

I2P sites can't be taken down easily. No DNS to seize, no hosting provider to pressure. The network routes around censorship by design.

Also useful for testing stuff without exposing it to clearnet. Your IP stays hidden, visitors' IPs stay hidden.

## Setup

First, get I2Pd running. If you're on Debian/Ubuntu:

```bash
sudo apt install i2pd lynx -y
```

Or use my [I2P Easy Manager](/projects/i2p-easy-manager/) if you want it automated.

Wait 10-15 minutes for I2Pd to integrate into the network. You can check status with `systemctl status i2pd`.

## I2P Tunnel

Configure the tunnel before setting up the web server. Edit I2Pd's tunnel config:

```bash
sudo nano /var/lib/i2pd/tunnels.conf
```

Add this at the end:

```
[eepsite]
type = http
host = 127.0.0.1
port = 80
keys = eepsite.dat
```

Restart I2Pd:

```bash
sudo systemctl restart i2pd
```

Now get your eepsite address. Open the I2Pd console in lynx:

```bash
lynx http://127.0.0.1:7070
```

Arrow down to "I2P Tunnels" and hit enter. In the "Server Tunnels" section, you'll see something like `verylonghash.b32.i2p`. That's your address. Write it down. Press `q` then `y` to quit lynx.

## Web Server

I followed the Let's Decentralize guide and used Caddy. Simpler than nginx for this.

```bash
echo "deb [trusted=yes] https://apt.fury.io/caddy/ /" | sudo tee -a /etc/apt/sources.list.d/caddy-fury.list
sudo apt update
sudo apt install caddy -y
```

Edit the Caddyfile:

```bash
sudo nano /etc/caddy/Caddyfile
```

Replace everything with this:

```
http://your-eepsite-address.b32.i2p {
    root * /var/www/eepsite
    file_server
    encode gzip
    bind 127.0.0.1
}
```

Replace `your-eepsite-address.b32.i2p` with your actual address from earlier. The `bind 127.0.0.1` line stops the easiest deanonymization attacks by preventing external connections.

Put your site files in `/var/www/eepsite`:

```bash
sudo mkdir -p /var/www/eepsite
# Copy your HTML files there
```

Or if you have it on GitHub like me:

```bash
sudo mkdir -p /var/www/eepsite
git clone https://github.com/username/repo /var/www/eepsite
```

And whenever you need to update it:

```bash
sudo rm -rf /var/www/eepsite
git clone https://github.com/username/repo /var/www/eepsite
```

Restart Caddy:

```bash
sudo systemctl restart caddy
```

Your site should be live. Test it by accessing your .b32.i2p address through I2P.

## Publishing Your Address

Nobody can find your site unless they know the address. A few ways to share it:

**hosts.txt** - Some people manually add addresses to their hosts file. Include yours in a hosts.txt on your clearnet site.

**Jump services** - Services like `stats.i2p` and `notbob.i2p` let you register a readable name. Point `yourname.i2p` at your long .b32.i2p address.

**Link from clearnet** - Put your .b32.i2p address on your regular website. People can click through if they have I2P configured.

## Tips

**Keep it light.** I2P is slow. No JavaScript, minimal CSS, optimized images only.

**Back up your keys.** The `eepsite.dat` file in `/var/lib/i2pd` (or wherever you configured the tunnel) is your identity. If you lose it, you lose your address. Copy it somewhere safe.

**Check your tunnel health.** The I2Pd console shows tunnel status. If it's red, your site's unreachable. Usually fixes itself, but sometimes you need to restart I2Pd.

**No analytics.** There's no Google Analytics equivalent that works well on I2P. Check your Caddy logs if you care about traffic: `sudo journalctl -u caddy`

**Use relative links.** People might access your site through different proxies or with different base URLs. Relative paths avoid issues.

That's it. You're live on I2P.