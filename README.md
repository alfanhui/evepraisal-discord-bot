# evepraisal-discord-bot

Eve corp discord evepraisal bot

## Prerequists

Please create secret.js on root directory, exporting the token string for Discord authentication:

    ```js
    // ./secret.js
    export const token = '<your_token>';
    ```

## Docker Setup

1. Build evepraisal image

        ```bash
        docker build -t evepraisal:latest .
        ```

2. Run docker-compose

        ```bash
        docker compose up -d
        ````

### Teardown

1. Stop docker compose containers

        ```bash
        docker compose down
        ```

2. Remove docker compose containers

        ```bash
        docker compose rm
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
