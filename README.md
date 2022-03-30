# evepraisal-discord-bot

Eve corp discord evepraisal bot

## Prerequisites

Please create .env file on root directory, exporting the token string for Discord authentication:

```bash
## ./.env
# NPM
NODE_OPTIONS=--max_old_space_size=256

# Evepraisal API
EVEPRAISAL_API_URL='https://evepraisal.com/appraisal/structured.json'
EVEPRAISAL_API_USER_AGENT='evepraisalDiscordBot'

# Discord
DISCORD_BOT_AUTHOR_ID=<your_bot_id>
DISCORD_BOT_TOKEN=<your_token>

# Eve
AVAILABLE_MARKETS=jita,perimeter,universe,amarr,dodixie,hek,rens
```

## Docker Setup

1. Build evepraisal image

    ```bash
    docker build -t evepraisal:latest .
    ```

2. Run docker-compose

    ```bash
    docker-compose up -d
    ````

### Teardown

1. Stop docker compose containers

    ```bash
    docker-compose down
    ```

2. Remove docker compose containers

    ```bash
    docker-compose rm
    ```

## Non-docker setup

1. `git clone git@github.com:alfanhui/evepraisal-discord-bot.git /opt`
2. `npm install`
3. `sudo cp evepraisal-bot.service /etc/systemd/system/evepraisal-bot.service`
4. `sudo systemctl enable evepraisal-bot.service`
5. `sudo systemctl start evepraisal-bot.service`

## Support

docker:

- Read logs: `docker compose logs -f`

non-docker:

- Read logs: `journalctl -fu evepraisal-bot.service`
- Restart service: `systemctl restart evepraisal-bot.service`

## Item Group Lists

Lists can be obtained here: [https://everef.net/](https://everef.net/)
Otherwise, the is now an scheduler that will update the lists every monday.

|| Group ID || Group ||
| ---- | -------------|
| 1996 | Abyssal Materials|
| 966| Ancient Salvage |
| 712| Biochemical Material |
| 429| Composite |
| 20 | Drug |
| 1136 | Fuel Block |
| 422 | Gas Isotopes |
| 974 | Hybrid Polymers |
| 423 | Ice Product |
| 428 | Intermediate Materials |
| 18 | Mineral |
| 17 | Money |
| 427 | Moon Materials |
| 1676 | Named Components |
| 886 | Rogue Drone Components |
| 754 | Salvaged Materials |
| 967 | Wormhole Minerals |
| 903 | Ancient Compressed Ice |
| 450 | Arkonor |
| 4031 | Bezdnacine |
| 451 | Bistot |
| 1920 | Common Moon Asteroids |
| 452 | Crokite |
| 453 | Dark Ochre |
| 2006 | Deadspace Asteroids |
| 1911 | Empire Asteroids |
| 1923 | Exceptional Moon Asteroids |
| 2024 | Fluorite |
| 467 | Gneiss |
| 454 | Hedbergite |
| 455 | Hemorphite |
| 465 | Ice |
| 456 | Jaspet |
| 457 | Kernite |
| 468 | Mercoxit |
| 469 | Omber |
| 458 | Plagioclase |
| 459 | Pyroxeres |
| 4030 | Rakovene |
| 1922 | Rare Moon Asteroids |
| 460 | Scordite |
| 461 | Spodumain |
| 4029 | Talassonite |
| 2022 | Temporal Resources |
| 519 | Terran Artifacts |
| 1884 | Ubiquitous Moon Asteroids |
| 1921 | Uncommon Moon Asteroids |
| 462 | Veldspar |
