# Scheduled tasks (systemd timers)

This folder contains the systemd unit files used to trigger the coaching app's
scheduled endpoints from the host server.

Currently scheduled:

| Unit                    | Schedule         | Endpoint                    | Purpose                                  |
| ----------------------- | ---------------- | --------------------------- | ---------------------------------------- |
| `coaching-alerts.timer` | Daily at `00:15` | `POST /api/alerts/generate` | Generates birthday alerts (7-day window) |

## Installation

Run these commands on the server (as root / with `sudo`).

### 1. Create the env file

```bash
sudo mkdir -p /etc/coaching
sudo cp deploy/cron/env.example /etc/coaching/cron.env
sudo chmod 600 /etc/coaching/cron.env
sudoedit /etc/coaching/cron.env
# Set BASE_URL and CRON_SECRET (must match the value in the app's .env)
```

Generate a fresh secret if needed:

```bash
openssl rand -hex 32
```

### 2. Install the unit files

```bash
sudo cp deploy/cron/coaching-alerts.service /etc/systemd/system/
sudo cp deploy/cron/coaching-alerts.timer   /etc/systemd/system/
sudo systemctl daemon-reload
```

### 3. Enable and start the timer

```bash
sudo systemctl enable --now coaching-alerts.timer
```

### 4. Verify

```bash
# Confirm the timer is armed and see the next scheduled run
sudo systemctl list-timers coaching-alerts.timer

# Run once manually to check connectivity
sudo systemctl start coaching-alerts.service

# Inspect the last run's logs
sudo journalctl -u coaching-alerts.service -n 100 --no-pager
```

## Updating the schedule

Edit the `OnCalendar=` line in `coaching-alerts.timer`, reinstall, then run
`sudo systemctl daemon-reload && sudo systemctl restart coaching-alerts.timer`.

Examples:

- Every 6 hours: `OnCalendar=*-*-* 00,06,12,18:00:00`
- Every Monday at 08:00: `OnCalendar=Mon *-*-* 08:00:00`
- Every 10 minutes (debug): `OnCalendar=*:0/10`

## Adding more scheduled jobs

1. Add a new `*.service` + `*.timer` pair (one per endpoint).
2. Re-use the same `/etc/coaching/cron.env`.
3. Install as above.

Ideas that fit naturally:

- Cleanup of old `AlertRecipient` rows marked as `DELETED`.
- Reminders for upcoming games.
- Periodic FPB sync.
