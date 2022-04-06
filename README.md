# evepraisal-discord-bot

Eve corp discord evepraisal bot

## Prerequisites

Please create .env file on root directory, exporting the token string for Discord authentication:

```ini
## ./.env
# NPM
NODE_OPTIONS=--max_old_space_size=256

# Eve API
EVE_API_URL = 'https://esi.evetech.net/'

# Evepraisal API
EVEPRAISAL_API_URL='https://evepraisal.com/appraisal/structured.json'
EVEPRAISAL_API_USER_AGENT='evepraisalDiscordBot'

# Discord
DISCORD_BOT_AUTHOR_ID=<your_bot_id>
DISCORD_BOT_TOKEN=<your_token>

# Eve
AVAILABLE_MARKETS=jita,perimeter,universe,amarr,dodixie,hek,rens

# Cron - Comment out to run once on startup (except on all_items)
#BUYBACK_ITEMS_UPDATE_CRON=0 0 2 * * MON
#SECONDARY_BUYBACK_ITEMS_UPDATE_CRON=0 10 2 * * MON
#ALL_ITEMS_UPDATE_CRON=0 0 3 * * MON

# Items
GROUPS=18,754,422,4,427,423,428,450,4031,451,1920,452,453,2006,1911,1923,2024,467,454,455,465,456,457,468,469,458,459,4030,1922,460,461,4029,2022,519,1884,1921,462,1033,1035,1032,1042,1034,1040
TYPE=
SECONDARY_GROUPS=465
SECONDARY_TYPES=
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
| 17 | Money |
| 18 | Mineral |
| 20 | Drug |
| 452 | Crokite |
| 453 | Dark Ochre |
| 422 | Gas Isotopes |
| 423 | Ice Product |
| 427 | Moon Materials |
| 428 | Intermediate Materials |
| 429 | Composite |
| 450 | Arkonor |
| 451 | Bistot |
| 454 | Hedbergite |
| 455 | Hemorphite |
| 465 | Ice |
| 456 | Jaspet |
| 457 | Kernite |
| 458 | Plagioclase |
| 459 | Pyroxeres |
| 460 | Scordite |
| 461 | Spodumain |
| 462 | Veldspar |
| 468 | Mercoxit |
| 467 | Gneiss |
| 469 | Omber |
| 519 | Terran Artifacts |
| 712 | Biochemical Material |
| 754 | Salvaged Materials |
| 886 | Rogue Drone Components |
| 903 | Ancient Compressed Ice |
| 966 | Ancient Salvage |
| 967 | Wormhole Minerals |
| 974 | Hybrid Polymers |
| 1032 | Planet Solid - Raw Resource |
| 1033 | Planet Liquid-Gas - Raw Resource |
| 1034 | Refined Commodities - Tier 2 |
| 1035 | Planet Organic - Raw Resource |
| 1041 | Advanced Commodities - Tier 4 |
| 1042 | Basic Commodities - Tier 1 |
| 1040 | Specialized Commodities - Tier 3 |
| 1136 | Fuel Block |
| 1676 | Named Components |
| 1884 | Ubiquitous Moon Asteroids |
| 1911 | Empire Asteroids |
| 1920 | Common Moon Asteroids |
| 1922 | Rare Moon Asteroids |
| 1921 | Uncommon Moon Asteroids |
| 1923 | Exceptional Moon Asteroids |
| 1996 | Abyssal Materials|
| 2006 | Deadspace Asteroids |
| 2022 | Temporal Resources |
| 2024 | Fluorite |
| 4030 | Rakovene |
| 4029 | Talassonite |
| 4031 | Bezdnacine |
