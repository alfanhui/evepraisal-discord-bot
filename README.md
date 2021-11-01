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
3. `cp evepraisal-bot.service /etc/systemd/system/evepraisal-bot.service`
4. `systemctl enable evepraisal-bot.service`
5. `systemctl start evepraisal-bot.service`

## Support

docker:

- Read logs: `docker compose logs -f`

non-docker:

- Read logs: `journalctl -fu evepraisal-bot.service`
- Restart service: `systemctl restart evepraisal-bot.service`

## Item lists

Lists obtained here: [https://everef.net/](https://everef.net/)
